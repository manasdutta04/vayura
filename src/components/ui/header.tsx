'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './auth-modal';
import { Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
    const { user, loading, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="Vayura"
                            className="h-8 sm:h-10 w-auto"
                        />
                        <span className="text-lg font-semibold text-gray-900 tracking-tight">Vayura</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/map"
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                        >
                            Map View
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                        >
                            Leaderboard
                        </Link>
                        <Link
                            href="/champions"
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                        >
                            Champions
                        </Link>
                        <Link
                            href="/challenges"
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                        >
                            Challenges
                        </Link>
                        <Link
                            href="/calculator"
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                        >
                            CO₂ Calculator
                        </Link>
                        <Link
                            href="/methodology"
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                        >
                            Methodology
                        </Link>
                        {user && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/analytics"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Analytics
                                </Link>
                                <Link
                                    href="/plant"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Plant a Tree
                                </Link>
                                <Link
                                    href="/donate"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Donate Tree
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile + Auth */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Hamburger Menu */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showMobileMenu ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        ) : user ? (
                            <>
                                <a
                                    href="https://github.com/manasdutta04/vayura"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:block px-4 py-2 border border-green-500/50 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-500 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    Contribute
                                </a>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.displayName || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/contribution"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                My Contributions
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <a
                                    href="https://github.com/manasdutta04/vayura"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:block px-4 py-2 border border-green-500/50 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-500 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    Contribute
                                </a>
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {showMobileMenu && (
                    <>
                        {/* Backdrop with fade animation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setShowMobileMenu(false)}
                        />

                        {/* Menu Drawer with slide animation */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 md:hidden overflow-y-auto shadow-2xl"
                        >
                            <nav className="flex flex-col p-4 pt-2 min-h-full">
                                {/* Menu Header with Close Button */}
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="flex items-center justify-between px-4 py-2 border-b border-gray-100"
                                >
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigate</h3>
                                    <button
                                        onClick={() => setShowMobileMenu(false)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-95"
                                        aria-label="Close menu"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </motion.div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="mt-2 space-y-1 flex-1"
                            >
                                <Link
                                    href="/map"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.487V6.513a2 2 0 011.553-1.943L9 2l5.447 2.724A2 2 0 0116 6.513v8.974a2 2 0 01-1.553 1.943L9 20z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2v18M16 6.513l-7-3.5M9 20l7-3.5" />
                                    </svg>
                                    <span>Map View</span>
                                </Link>

                                <Link
                                    href="/leaderboard"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span>Leaderboard</span>
                                </Link>

                                <Link
                                    href="/champions"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span>Champions</span>
                                </Link>

                                <Link
                                    href="/challenges"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span>Challenges</span>
                                </Link>

                                <Link
                                    href="/calculator"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span>CO₂ Calculator</span>
                                </Link>

                                <Link
                                    href="/methodology"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Methodology</span>
                                </Link>

                                {user && (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                        >
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </Link>
                                    </>
                                )}

                                <div className="my-3 border-t border-gray-100"></div>

                                <Link
                                    href="/plant"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Plant a Tree</span>
                                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Action</span>
                                </Link>

                                <Link
                                    href="/donate"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Donate Tree</span>
                                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Action</span>
                                </Link>
                                
                                {/* Mobile Contribute Button */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <a
                                        href="https://github.com/manasdutta04/vayura"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-green-500/50 text-gray-700 text-sm font-medium rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-500 transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                        Contribute on GitHub
                                    </a>
                                </div>
                            </motion.div>

                            {/* Footer Info */}
                            <div className="pt-6 pb-4 px-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                                    Vayura - Making India Greener <Sprout className="w-4 h-4 text-green-500" />
                                </p>
                            </div>
                        </nav>
                    </motion.div>
                </>
            )}
            </AnimatePresence>

            {/* Spacer for fixed header */}
            <div className="h-16 md:h-16" />

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}