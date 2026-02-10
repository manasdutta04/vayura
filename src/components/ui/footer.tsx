'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Github, Heart, Sprout, Linkedin } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-10"
        >
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt={t('common.brandName')}
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold text-gray-900 tracking-tight">
                {t('common.brandName')}
              </span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {t('footer.description')}
            </p>

            <div className="flex gap-4">
              <a
                href="https://github.com/manasdutta04/vayura"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/manasdutta04/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('footer.platform')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('footer.stateLeaderboard')}
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('nav.calculator')}
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('nav.methodology')}
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Take Action */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('footer.takeAction')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/plant" className="text-sm text-gray-500 hover:text-green-600 transition-colors flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  {t('nav.plantTree')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-sm text-gray-500 hover:text-green-600 transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {t('footer.donateTrees')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/data-policy" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  {t('footer.dataSources')}
                </Link>
              </li>
            </ul>
          </div>

        </nav>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{t('common.builtWithLove')}</span>
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
