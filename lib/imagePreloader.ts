import { characters } from './characters';

class ImagePreloader {
  private loadedImages = new Set<string>();
  private loadingImages = new Map<string, Promise<void>>();

  preload(src: string): Promise<void> {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src)!;
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(src);
        this.loadingImages.delete(src);
        resolve();
      };
      
      img.onerror = () => {
        this.loadingImages.delete(src);
        console.warn(`Failed to preload image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.loadingImages.set(src, loadPromise);
    return loadPromise;
  }

  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  preloadMany(sources: string[]): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(sources.map(src => this.preload(src)));
  }
}

export const imagePreloader = new ImagePreloader();

export const preloadCharacterImages = () => {
  const imageSources = characters.map(character => character.portraitUrl);
  return imagePreloader.preloadMany(imageSources);
};
