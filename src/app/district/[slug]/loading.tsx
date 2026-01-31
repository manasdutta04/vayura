import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Skeleton from '@/components/ui/skeleton-card';

export default function Loading() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
                <section className="max-w-6xl mx-auto px-6 pt-10">
                    {/* Page Header Skeleton */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-10 w-96" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-12 w-40 rounded-full" />
                            <Skeleton className="h-12 w-40 rounded-full" />
                        </div>
                    </div>

                    {/* Summary Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow border border-gray-100 h-32 flex flex-col justify-center space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 h-96">
                            <Skeleton className="h-6 w-64 mb-6" />
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex justify-between border-b border-gray-50 pb-3">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 h-96">
                             <Skeleton className="h-6 w-64 mb-6" />
                             <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full mt-4" />
                                <Skeleton className="h-4 w-2/3" />
                             </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}