'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Linkedin, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
    districtName: string;
    state: string;
    aqi: number;
    treesRequired: number;
    population: number;
    url?: string;
}

export function ShareButtons({
    districtName,
    state,
    aqi,
    treesRequired,
    population,
    url
}: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Get current URL or use provided one
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    
    // Create share text
    const shareText = `🌳 ${districtName}, ${state} needs ${formatNumber(treesRequired)} trees to balance oxygen demand!

📊 Current Stats:
• Population: ${formatCompactNumber(population)}
• AQI: ${Math.round(aqi)}
• Trees Required: ${formatCompactNumber(treesRequired)}

Help spread awareness about environmental health! 🌍`;

    const shortShareText = `${districtName}, ${state} needs ${formatCompactNumber(treesRequired)} trees to balance oxygen demand! AQI: ${Math.round(aqi)} | Check the data →`;

    function formatNumber(num: number): string {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    function formatCompactNumber(num: number): string {
        if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortShareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=550,height=420');
    };

    const handleWhatsAppShare = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleLinkedInShare = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank', 'width=550,height=420');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="relative">
            {/* Main share button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 transition"
            >
                <Share2 className="w-4 h-4" />
                Share
            </button>

            {/* Share menu dropdown */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-20">
                        <div className="p-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Share this data
                            </p>
                            
                            <div className="space-y-1">
                                {/* Twitter */}
                                <button
                                    onClick={handleTwitterShare}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                        <Twitter className="w-4 h-4 text-white" fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Twitter / X</span>
                                </button>

                                {/* Facebook */}
                                <button
                                    onClick={handleFacebookShare}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                                        <Facebook className="w-4 h-4 text-white" fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Facebook</span>
                                </button>

                                {/* WhatsApp */}
                                <button
                                    onClick={handleWhatsAppShare}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-4 h-4 text-white" fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">WhatsApp</span>
                                </button>

                                {/* LinkedIn */}
                                <button
                                    onClick={handleLinkedInShare}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                                        <Linkedin className="w-4 h-4 text-white" fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">LinkedIn</span>
                                </button>

                                {/* Divider */}
                                <div className="border-t border-gray-200 my-2" />

                                {/* Copy Link */}
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        {copied ? (
                                            <Check className="w-4 h-4 text-nature-600" />
                                        ) : (
                                            <Link2 className="w-4 h-4 text-gray-600" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {copied ? 'Link copied!' : 'Copy link'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}