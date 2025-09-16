"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // This is a placeholder for a real analytics service.
    console.log(`Page view: ${pathname}`);
  }, [pathname]);

  return null;
}
