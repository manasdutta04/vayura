"use client";

import {useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { AuthModal } from "./auth-modal";
import { Sprout, Menu, X, Github, Map, BarChart3, Trophy, Zap, Calculator, BookOpen, LayoutGrid, TrendingUp, Leaf, DollarSign, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./language-switcher";
import Image from "next/image";

export function Header() {
  const t = useTranslations();
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [photoErrorURL, setPhotoErrorURL] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt={t("common.brandName")}
              className="h-8 sm:h-10 w-auto"
              width={40}
              height={40}
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              {t("common.brandName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/map"
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all font-medium"
            >
              {t("nav.mapView")}
            </Link>
            <Link
              href="/leaderboard"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
            >
              {t("nav.leaderboard")}
            </Link>
            <Link
              href="/champions"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
            >
              {t("nav.champions")}
            </Link>
            <Link
              href="/challenges"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
            >
              {t("nav.challenges")}
            </Link>
            <Link
              href="/calculator"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
            >
              {t("nav.calculator")}
            </Link>
            <Link
              href="/methodology"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
            >
              {t("nav.methodology")}
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/analytics"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
                >
                  {t("nav.analytics")}
                </Link>
                <Link
                  href="/plant"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
                >
                  {t("nav.plantTree")}
                </Link>
                <Link
                  href="/donate"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all font-medium"
                >
                  {t("nav.donateTree")}
                </Link>
              </>
            )}
          </nav>

          {/* Mobile + Auth + Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <>
                <a
                  href="https://github.com/manasdutta04/vayura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex px-4 py-2 border border-green-500/50 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-500 transition-all items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                >
                  <Github className="w-4 h-4" />
                  {t("nav.contribute")}
                </a>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {user.photoURL && user.photoURL !== photoErrorURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="rounded-full object-cover"
                        width={32}
                        height={32}
                        referrerPolicy="no-referrer"
                        onError={() => setPhotoErrorURL(user.photoURL)}
                      />
                    ) : (
                      <div
                        className="rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                        }}
                      >
                        {(user.displayName ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.displayName || "User"}
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
                        {t("nav.profile")}
                      </Link>
                      <Link
                        href="/contribution"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {t("nav.myContributions")}
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        {t("auth.signOut")}
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
                  className="hidden lg:flex px-4 py-2 border border-green-500/50 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-500 transition-all items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                >
                  <Github className="w-4 h-4" />
                  {t("nav.contribute")}
                </a>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  {t("auth.signIn")}
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Menu Drawer with slide animation */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl"
            >
              <nav className="flex flex-col p-4 pt-2 min-h-full">
                {/* Menu Header with Close Button */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center justify-between px-4 py-2 border-b border-gray-100"
                >
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {t("nav.navigate")}
                  </h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-95"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
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
                    <Map className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                    <span>{t("nav.mapView")}</span>
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                    <span>{t("nav.leaderboard")}</span>
                  </Link>

                  <Link
                    href="/champions"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <Trophy className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                    <span>{t("nav.champions")}</span>
                  </Link>

                  <Link
                    href="/challenges"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <Zap className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                    <span>{t("nav.challenges")}</span>
                  </Link>

                  <Link
                    href="/calculator"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <Calculator className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                    <span>{t("nav.calculator")}</span>
                  </Link>

                  <Link
                    href="/methodology"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>{t("nav.methodology")}</span>
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span>{t("nav.dashboard")}</span>
                      </Link>
                    </>
                  )}

                  <div className="my-3 border-t border-gray-100"></div>

                  <Link
                    href="/plant"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>{t("nav.plantTree")}</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      {t("common.action")}
                    </span>
                  </Link>

                  <Link
                    href="/donate"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{t("nav.donateTree")}</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      {t("common.action")}
                    </span>
                  </Link>

                  {/* Mobile Contribute Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href="https://github.com/manasdutta04/vayura"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-green-500/50 text-gray-700 text-sm font-medium rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-500 transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    >
                      <Github className="w-5 h-5" />
                      {t("nav.contributeOnGithub")}
                    </a>
                  </div>
                </motion.div>

                {/* Footer Info */}
                <div className="pt-6 pb-4 px-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    {t("common.brandName")} - {t("common.builtWithLove")}{" "}
                    <Sprout className="w-4 h-4 text-green-500" />
                  </p>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
