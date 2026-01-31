'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Upload, MapPin, TreePine, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export default function PlantPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Show loading state
    const toastId = toast.loading("Uploading your contribution...")

    if (!session) {
      toast.dismiss(toastId)
      toast.error("Please sign in to contribute")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    // Add user email to formData for backend tracking
    if (session.user?.email) {
      formData.append('userEmail', session.user.email)
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