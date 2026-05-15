'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The instructor panel has moved to /dashboard.
 * This redirect ensures any saved links still work.
 */
export default function InstructorPanelRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
