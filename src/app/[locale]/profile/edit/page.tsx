'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { updateUserProfileFields, getUserProfile } from '@/lib/utils/user-profile';
import { uploadProfileImage } from '@/lib/utils/storage';
import { UserProfile } from '@/lib/types/firestore';
import { User, Mail, Camera, Save, ArrowLeft, Upload, X } from 'lucide-react';

export default function EditProfilePage() {
  const { user, loading, updateUserProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/?auth_required=true');
    }
  }, [user, loading, router]);

  // Initialize profile state with user data
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          // First, try to get the profile from Firestore
          const userProfile = await getUserProfile(user.uid);

          if (userProfile) {
            // Use the Firestore profile data
            setProfile({
              name: userProfile.name || user.displayName || user.email?.split('@')[0],
              email: user.email || '',
              photoURL: userProfile.photoURL || user.photoURL || '',
              bio: userProfile.bio || '',
            });
            setPreviewImage(userProfile.photoURL || user.photoURL || '');
          } else {
            // Fallback to basic user data if no profile exists
            setProfile({
              name: user.displayName || user.email?.split('@')[0],
              email: user.email || '',
              photoURL: user.photoURL || '',
              bio: '',
            });
            setPreviewImage(user.photoURL || '');
          }

          // Don't set selectedFile here since we're not dealing with a new file
          setSelectedFile(null);
          setLoadingProfile(false);
        } catch (error) {
          console.error('Error loading profile:', error);
          // Fallback to basic user data
          setProfile({
            name: user.displayName || user.email?.split('@')[0],
            email: user.email || '',
            photoURL: user.photoURL || '',
            bio: '',
          });
          setPreviewImage(user.photoURL || '');
          setSelectedFile(null);
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB to match storage validation)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }

      // Store the selected file for later upload
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        // Store the data URL as photoURL for preview purposes
        setProfile(prev => ({
          ...prev,
          photoURL: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setProfile(prev => ({
      ...prev,
      photoURL: ''
    }));
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare update data, excluding undefined/null values
      // Also exclude phone and address as they should not be stored
      const updateData: Record<string, unknown> = {};
      if (profile.name !== undefined && profile.name !== null && profile.name.trim() !== '') {
        updateData.name = profile.name.trim();
      }
      if (profile.bio !== undefined && profile.bio !== null && profile.bio.trim() !== '') {
        updateData.bio = profile.bio.trim();
      }

      // Handle photoURL - if it's a data URL (local file), upload it to storage first
      if (profile.photoURL !== undefined && profile.photoURL !== null && profile.photoURL.trim() !== '') {
        if (profile.photoURL.startsWith('data:image')) {
          // This is a local file, use the stored selected file
          if (selectedFile) {
            try {
              const uploadResult = await uploadProfileImage(selectedFile, user.uid);
              updateData.photoURL = uploadResult.url;
            } catch (uploadError) {
              console.error('Error uploading profile image:', uploadError);
              throw new Error('Failed to upload profile image. Please make sure Firebase Storage is properly configured in your project.');
            }
          } else {
            // If we don't have the file, we can't upload it, so we'll skip updating the photoURL
            console.log('No file to upload for profile image');
          }
        } else {
          // It's a valid URL, so we can update it
          updateData.photoURL = profile.photoURL.trim();
        }
      }

      console.log("Update data:", updateData); // Debug log
      console.log("User ID:", user.uid); // Debug log

      // Update Firestore profile
      const success = await updateUserProfileFields(user.uid, updateData);
      console.log("Update result:", success); // Debug log

      if (success) {
        // Also update Firebase Auth profile
        if (updateData.name || updateData.photoURL) {
          await updateUserProfile(
            (updateData.name as string) || user.displayName || user.email?.split('@')[0] || 'User',
            (updateData.photoURL as string)
          );
        }

        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-20">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="h-10 w-24 bg-gray-200 rounded mb-8"></div>

              {/* Form skeleton */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
                    </div>
                  ))}
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-20">
        <div className="max-w-2xl mx-auto px-6 py-12">

          {/* Back Button */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-3 text-gray-700 hover:text-green-700 transition-colors mb-8 group px-4 py-2 rounded-lg hover:bg-gray-100 w-fit"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Profile</span>
          </Link>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-600 mb-8">Update your personal information and preferences</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                {success}
              </div>
            )}

            {/* Profile Picture */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Profile Photo</label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-green-600" />
                    )}
                  </div>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={triggerFileSelect}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-500">JPG, PNG, or GIF (Max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field (disabled) */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Email cannot be changed"
                />
              </div>
            </div>



            {/* Bio Field */}
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
                About Me
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 focus:bg-white resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>



            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
                className="px-6 py-3 border-gray-300 hover:bg-gray-50 font-medium rounded-xl transition-all hover:shadow-md"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}