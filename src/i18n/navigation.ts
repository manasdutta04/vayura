import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Wrap Next.js navigation APIs to support i18n
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
