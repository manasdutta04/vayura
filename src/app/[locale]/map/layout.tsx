import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive District Map | Vayura',
  description: 'Explore oxygen self-sufficiency across Indian districts through our interactive environmental map.',
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      {children}
    </div>
  );
}
