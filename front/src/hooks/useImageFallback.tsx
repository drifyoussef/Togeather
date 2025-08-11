import { useCallback } from 'react';
import defaultImage from '../images/default-image.png'

interface UseImageFallbackProps {
  defaultSrc?: string;
}

export const useImageFallback = ({ 
  defaultSrc = defaultImage
}: UseImageFallbackProps = {}) => {
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    
    // Éviter les boucles infinies si l'image par défaut échoue aussi
    if (target.src !== defaultSrc) {
      target.src = defaultSrc;
    }
  }, [defaultSrc]);

  return { handleImageError };
};