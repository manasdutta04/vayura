'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { getUserProfile } from '@/lib/utils/user-profile';
import { UserProfile } from '@/lib/types/firestore';
import { User, Mail, Calendar, Edit3, ArrowLeft, Camera, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/?auth_required=true');
    }
  }, [user, loading, router]);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.uid) return;
      
      setProfileLoading(true);
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Create initial profile with basic info
          setProfile({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || '',
            photoURL: user.photoURL || '',
            bio: '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading || profileLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-20">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="h-10 w-24 bg-gray-200 rounded mb-8"></div>
              
              {/* Profile header skeleton */}
              <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-100 rounded"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Profile details skeleton */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || !profile) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    // Note: Actual account deletion would require additional implementation
    // This is a placeholder for the functionality
    alert('Account deletion functionality would be implemented here');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Back Button */}
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profile.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt={profile.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-green-600" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.name || 'No name set'}
                </h1>
                <p className="text-gray-600 mb-6 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
                
                {/* Edit Profile Button */}
                <Button 
                  onClick={() => router.push('/profile/edit')}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Profile Information
            </h2>
            
            <div className="space-y-6">
              {/* Login Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Login Email</h3>
                  <p className="text-gray-600">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Member Since</h3>
                  <p className="text-gray-600">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Account Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl border border-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
              
              <button 
                onClick={handleDeleteAccount}
                className="flex items-center justify-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl border border-gray-200 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}