"use client";
import { useEffect } from 'react';
import { preloadCharacterImages } from '@/lib/imagePreloader';

export function ImagePreloader() {
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      preloadCharacterImages()
        .then((results) => {
          const failedCount = results.filter(result => result.status === 'rejected').length;
          const successCount = results.length - failedCount;
          
          if (failedCount > 0) {
            console.warn(`Preloaded ${successCount}/${results.length} character images (${failedCount} failed)`);
          } else {
            console.log('All character images preloaded successfully');
          }
        });
    }, 100);

    return () => clearTimeout(preloadTimer);
  }, []);

  return null;
}
