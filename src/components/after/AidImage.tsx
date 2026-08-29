import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface AidImageProps {
  title: string;
  category: string;
  type: 'HAVE' | 'NEED';
  imageUrl?: string;
}

export const AidImage: React.FC<AidImageProps> = ({ title, category, type, imageUrl }) => {
  const [error, setError] = useState(false);

  // Responsive container styles matching the exact dimensions required
  const containerClasses = "w-full h-[140px] sm:w-[120px] sm:h-[120px] shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50";

  if (error) {
    return (
      <div className={`${containerClasses} flex items-center justify-center text-slate-400`}>
        <Package className="w-8 h-8" />
      </div>
    );
  }

  // Map category or title keywords to high-quality, realistic, non-dramatic Unsplash images
  const getFallbackUrl = () => {
    const t = title.toLowerCase();
    const c = category.toLowerCase();

    // Woolen Blankets / Blankets & Kids Warm Clothes / Blankets & Clothing
    if (t.includes('blanket') || c.includes('blanket')) {
      return 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=400&q=80';
    }
    // Adult Unisex Clothing Packs / Blankets & Clothing
    if (t.includes('clothing') || t.includes('clothes') || c.includes('clothing') || c.includes('clothes')) {
      return 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=400&q=80';
    }
    // Drinking Water / Sealed Water Crates
    if (t.includes('water') || c.includes('water')) {
      return 'https://images.unsplash.com/photo-1560013469-13ff22cc55c7?auto=format&fit=crop&w=400&q=80';
    }
    // First Aid Medical Supplies / Medical Kits / Tetanus Vaccines
    if (t.includes('first aid') || t.includes('medical') || t.includes('vaccine') || c.includes('medical') || c.includes('kit') || t.includes('tetanus')) {
      return 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80';
    }
    // Dry Rations and Rice Packs / Food & Rations
    if (t.includes('ration') || t.includes('rice') || t.includes('food') || c.includes('food') || c.includes('ration') || t.includes('wheat') || t.includes('pack')) {
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
    }
    // Backup Generator Fuel (Diesel) / Generators & Power
    if (t.includes('generator') || t.includes('fuel') || t.includes('diesel') || t.includes('power') || c.includes('generator') || c.includes('power')) {
      return 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=400&q=80';
    }
    // Generic fallback for any other categories
    return 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80';
  };

  const src = imageUrl || getFallbackUrl();
  const altText = `${title} ${type === 'HAVE' ? 'available for' : 'needed at'} relief`;

  return (
    <div className={containerClasses}>
      <img
        src={src}
        alt={altText}
        onError={() => setError(true)}
        loading="lazy"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
