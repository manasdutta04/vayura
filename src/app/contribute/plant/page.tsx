'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/ui/header';
import { useAuth } from '@/lib/auth-context';
import { createImagePreview, revokeImagePreview, validateImageFile } from '@/lib/utils/storage';

function PlantContributionForm() {
    const searchParams = useSearchParams();
    const districtId = searchParams.get('districtId') || '';
    const districtName = searchParams.get('districtName') || '';
    const { user } = useAuth();

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) revokeImagePreview(previewUrl);
        };
    }, [previewUrl]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid image file');
            return;
        }

        if (previewUrl) revokeImagePreview(previewUrl);
        setImage(file);
        setPreviewUrl(createImagePreview(file));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!districtId) {
            setError('District is required. Navigate from a district page to auto-fill it.');
            return;
        }

        if (!image) {
            setError('Please upload a tree photo.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('districtId', districtId);
            if (user?.uid) formData.append('userId', user.uid);
            if (user?.displayName) formData.append('userName', user.displayName);
            if (user?.email) formData.append('userEmail', user.email);
            if (notes) formData.append('notes', notes);
            formData.append('image', image);

            const res = await fetch('/api/contribute/plant', {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'Failed to submit contribution');
            }

            setSuccess(json.message || 'Tree contribution submitted and pending verification.');
            setImage(null);
            if (previewUrl) revokeImagePreview(previewUrl);
            setPreviewUrl(null);
            setNotes('');
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to submit contribution');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
                <section className="max-w-3xl mx-auto px-6 pt-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Plant a tree for your district
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Upload a clear photo of the tree you planted. Contributions are tagged to your
                        district and marked as pending until verified.
                    </p>

                    {!user && (
                        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Sign in to link your contribution to your profile. You can still submit
                            anonymously, but some features may be limited.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow px-6 py-6 border border-gray-100 space-y-5"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                District
                            </label>
                            <input
                                type="text"
                                value={districtName || districtId}
                                readOnly
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                            />
                            {!districtId && (
                                <p className="mt-1 text-xs text-red-600">
                                    District is not set. Go to a district page and click “I planted a
                                    tree”.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tree photo (JPEG/PNG)
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-nature-50 file:text-nature-700 hover:file:bg-nature-100"
                            />
                            {previewUrl && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-1">Preview</p>
                                    <Image
                                        src={previewUrl}
                                        alt="Tree preview"
                                        width={400}
                                        height={300}
                                        className="rounded-xl border border-gray-200 max-h-64 object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-nature-500 focus:border-nature-500 outline-none text-sm"
                                placeholder="Where did you plant it? Any species or care details you want to share?"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 max-w-xs">
                                By submitting, you confirm that this photo is authentic and that you
                                consent to it being used for aggregated, anonymized impact reporting.
                            </p>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center px-5 py-3 rounded-full bg-nature-600 text-white text-sm font-semibold hover:bg-nature-700 disabled:opacity-60"
                            >
                                {submitting ? 'Submitting...' : 'Submit proof'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-xs text-gray-500">
                        This feature is for environmental awareness only. Data is approximate and not
                        intended for medical or policy use.
                    </p>

                    <p className="mt-4 text-sm text-gray-600">
                        Prefer to support an NGO?{' '}
                        <Link
                            href="https://tree-nation.com/"
                            target="_blank"
                            className="text-nature-700 font-semibold underline"
                        >
                            Donate trees via an external partner
                        </Link>
                        .
                    </p>
                </section>
            </main>
    );
}

export default function PlantContributionPage() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
                    <section className="max-w-3xl mx-auto px-6 pt-10">
                        <div className="bg-white rounded-2xl shadow px-6 py-6 border border-gray-100">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                            </div>
                        </div>
                    </section>
                </main>
            }>
                <PlantContributionForm />
            </Suspense>
        </>
    );
}


'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Upload, MapPin, TreePine, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

export default function PlantPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Show loading state
    const toastId = toast.loading("Uploading your contribution...")

    if (!user) {
      toast.dismiss(toastId)
      toast.error("Please sign in to contribute")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    // Add user email to formData for backend tracking
    if (user?.email) {
      formData.append('userEmail', user.email)
    }

    try {
      const res = await fetch('/api/contribute/plant', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      // Success Notification
      toast.success('Tree contribution uploaded successfully!', {
        id: toastId,
        description: "Thank you for making the world greener!"
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      // Error Notification
      toast.error("Failed to upload contribution", {
        id: toastId,
        description: "Please check your details and try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Register Your Tree</h1>
        <p className="text-muted-foreground mt-2">
          Upload details of the tree you've planted to track your impact.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Tree Photo
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-56 object-contain" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  name="image" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  required 
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Species Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tree Species</label>
              <div className="relative">
                <TreePine className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  name="species"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. Oak, Pine, Mango"
                  required
                />
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  name="location"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="City, Region"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Planted</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                name="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            {isSubmitting ? 'Uploading...' : 'Submit Contribution'}
          </button>
        </form>
      </div>
    </div>
  )
}
