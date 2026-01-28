import { notFound } from 'next/navigation';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DistrictDetail } from '@/lib/types';
import { DistrictClientPage } from '@/components/district-client-page';

async function getDistrictDetail(slug: string): Promise<DistrictDetail | null> {
    try {
        // For server components, use absolute URL with environment variable or fallback
        // In production, this should be set to the actual domain
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        
        const res = await fetch(`${baseUrl}/api/districts/${slug}`, {
            cache: 'no-store',
        });
        
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Error fetching district detail:', error);
        return null;
    }
}

interface DistrictPageProps {
    params: Promise<{ slug: string }>;
}

export default async function DistrictPage({ params }: DistrictPageProps) {
    const { slug } = await params;
    
    if (!slug) {
        notFound();
    }
    
    // Fetch initial data on the server for SEO and initial render
    const initialData = await getDistrictDetail(slug);
    
    // For server-side rendering, we still want to show 404 if data is not found
    // But the client component will handle offline scenarios
    if (!initialData) notFound();

    return (
        <>
            <Header />
            <DistrictClientPage slug={slug} initialData={initialData} />
            <Footer />
        </>
    );
}


