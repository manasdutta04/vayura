'use client';

import { Badge, BADGE_DEFINITIONS, BadgeType } from '@/lib/types/champions';
import {
    Sprout,
    TreeDeciduous,
    Trophy,
    Star as StarIcon,
    Shield,
    Crown,
    Sparkles
} from 'lucide-react';
import { ReactNode } from 'react';

interface BadgeDisplayProps {
    badge: Badge;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

const containerSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
};

const tierColors = {
    bronze: 'from-orange-200 to-orange-300',
    silver: 'from-gray-200 to-gray-300',
    gold: 'from-yellow-200 to-amber-300',
    platinum: 'from-purple-200 to-indigo-300',
};

const tierIconColors = {
    bronze: 'text-orange-600',
    silver: 'text-gray-600',
    gold: 'text-amber-600',
    platinum: 'text-purple-600',
};

// Mapping from icon names to components
function getBadgeIcon(iconName: string, className: string): ReactNode {
    switch (iconName) {
        case 'Sprout':
            return <Sprout className={className} />;
        case 'TreeDeciduous':
            return <TreeDeciduous className={className} />;
        case 'Trophy':
            return <Trophy className={className} />;
        case 'Star':
            return <StarIcon className={className} />;
        case 'Shield':
            return <Shield className={className} />;
        case 'Crown':
            return <Crown className={className} />;
        default:
            return <Sparkles className={className} />;
    }
}

export function BadgeIcon({ badge, size = 'sm', showTooltip = true }: BadgeDisplayProps) {
    const definition = BADGE_DEFINITIONS[badge.type];
    const iconColor = tierIconColors[definition.tier];

    return (
        <span
            className={`inline-flex items-center justify-center cursor-help transition-transform hover:scale-110`}
            title={showTooltip ? `${definition.name}: ${definition.description}` : undefined}
        >
            {getBadgeIcon(definition.icon, `${sizeClasses[size]} ${iconColor}`)}
        </span>
    );
}

export function BadgeCard({ badge, size = 'md' }: BadgeDisplayProps) {
    const definition = BADGE_DEFINITIONS[badge.type];

    return (
        <div
            className={`flex items-center gap-3 bg-gradient-to-r ${tierColors[definition.tier]} p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer`}
            title={definition.description}
        >
            <div className={`${containerSizes[size]} rounded-full bg-white/80 flex items-center justify-center shadow-inner`}>
                {getBadgeIcon(definition.icon, `${sizeClasses[size]} ${tierIconColors[definition.tier]}`)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{definition.name}</p>
                <p className="text-xs text-gray-600 truncate">{definition.requirement}</p>
            </div>
        </div>
    );
}

export function BadgeGrid({ badges, maxDisplay = 6 }: { badges: Badge[]; maxDisplay?: number }) {
    const displayBadges = badges.slice(0, maxDisplay);
    const remaining = badges.length - maxDisplay;

    return (
        <div className="flex flex-wrap gap-2">
            {displayBadges.map((badge) => (
                <BadgeIcon key={badge.id} badge={badge} size="md" />
            ))}
            {remaining > 0 && (
                <span className="text-sm text-gray-400 self-center">+{remaining} more</span>
            )}
        </div>
    );
}

export function BadgeShowcase({ badges }: { badges: Badge[] }) {
    if (badges.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No badges earned yet</p>
                <p className="text-xs mt-1 flex items-center justify-center gap-1">
                    Start planting to earn your first badge!
                    <Sprout className="w-4 h-4 text-green-500" />
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} size="md" />
            ))}
        </div>
    );
}

// Progress indicator for next badge
export function NextBadgeProgress({
    currentTrees,
    nextBadgeType,
    requiredTrees,
}: {
    currentTrees: number;
    nextBadgeType: BadgeType;
    requiredTrees: number;
}) {
    const definition = BADGE_DEFINITIONS[nextBadgeType];
    const progress = Math.min((currentTrees / requiredTrees) * 100, 100);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="opacity-50">
                        {getBadgeIcon(definition.icon, `w-6 h-6 ${tierIconColors[definition.tier]}`)}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{definition.name}</p>
                        <p className="text-xs text-gray-500">{definition.requirement}</p>
                    </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                    {currentTrees}/{requiredTrees}
                </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${progress >= 100
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {progress >= 100 && (
                <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Ready to claim!
                </p>
            )}
        </div>
    );
}

