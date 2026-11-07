import React, { useState } from 'react';
import {
  Camera,
  Cpu,
  Calculator,
  Laptop,
  BookOpen,
  Speaker,
  Compass,
  Trophy,
  Music,
  Sparkles,
  Armchair,
  Package,
} from 'lucide-react';
import type { RentalCategory } from '../utils/rentalLogic';

interface ProductVisualProps {
  photoKey: string;
  category: RentalCategory;
  title: string;
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  photoKey,
  category,
  title,
  className = 'w-full h-48',
}) => {
  const [imgError, setImgError] = useState(false);

  const isUploadedImage =
    !imgError &&
    typeof photoKey === 'string' &&
    (photoKey.startsWith('data:image/') ||
      photoKey.startsWith('http://') ||
      photoKey.startsWith('https://') ||
      photoKey.startsWith('/'));

  const getVisualTheme = () => {
    switch (category) {
      case 'Cameras and Photography':
        return {
          bg: 'from-[#E6F4EE] via-[#F2FBF7] to-[#D9EFE6]',
          accent: '#1F9D55',
          tag: '4K Optical Gear',
          Icon: Camera,
        };
      case 'Engineering Lab Equipment':
        return {
          bg: 'from-[#E8F1FA] via-[#F4F8FD] to-[#DCEBFA]',
          accent: '#1D68C4',
          tag: 'IEEE / Lab Tested',
          Icon: Cpu,
        };
      case 'Scientific Calculators':
        return {
          bg: 'from-[#EEF0F8] via-[#F7F8FC] to-[#E2E6F4]',
          accent: '#3949AB',
          tag: 'Exam Approved',
          Icon: Calculator,
        };
      case 'Laptops and Electronics':
        return {
          bg: 'from-[#E9F3F8] via-[#F5FAFC] to-[#DCECF5]',
          accent: '#0E7490',
          tag: 'Apple / Pro Tech',
          Icon: Laptop,
        };
      case 'Books and Study Material':
        return {
          bg: 'from-[#FBF3E4] via-[#FDF9F1] to-[#F6E8CE]',
          accent: '#B45309',
          tag: 'Annotated Edition',
          Icon: BookOpen,
        };
      case 'Projectors and Speakers':
        return {
          bg: 'from-[#F1ECF9] via-[#F8F5FD] to-[#E6DDF6]',
          accent: '#6C4CF1',
          tag: '160W Stage Audio',
          Icon: Speaker,
        };
      case 'Travel Accessories':
        return {
          bg: 'from-[#E6F4EA] via-[#F2FAF4] to-[#D4EDE0]',
          accent: '#15803D',
          tag: 'Sahyadri Trek Ready',
          Icon: Compass,
        };
      case 'Sports Equipment':
        return {
          bg: 'from-[#E8F6F3] via-[#F4FBF9] to-[#D5EFEA]',
          accent: '#0D9488',
          tag: 'Gymkhana Pro',
          Icon: Trophy,
        };
      case 'Musical Instruments':
        return {
          bg: 'from-[#FDF0E6] via-[#FEF7F2] to-[#F9E2D0]',
          accent: '#C2410C',
          tag: 'Acoustic Studio',
          Icon: Music,
        };
      case 'Event Equipment':
        return {
          bg: 'from-[#EDF1F7] via-[#F7F9FC] to-[#E1E8F2]',
          accent: '#334155',
          tag: 'Full HD 1080p',
          Icon: Sparkles,
        };
      case 'Furniture and Other Items':
        return {
          bg: 'from-[#F2F4F7] via-[#F9FAFB] to-[#E5E9F0]',
          accent: '#475569',
          tag: 'Hostel Ergonomic',
          Icon: Armchair,
        };
      default:
        return {
          bg: 'from-[#E7F6F2] via-[#F4FBF8] to-[#D9EFF7]',
          accent: '#1F9D55',
          tag: 'Campus Verified',
          Icon: Package,
        };
    }
  };

  const theme = getVisualTheme();
  const IconComponent = theme.Icon;

  if (isUploadedImage) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}
      >
        <img
          src={photoKey}
          alt={title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.bg} flex flex-col items-center justify-center select-none ${className}`}
      role="img"
      aria-label={title}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-${photoKey.slice(0, 20)}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={theme.accent}
              strokeWidth="0.5"
              strokeOpacity="0.25"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-${photoKey.slice(0, 20)})`}
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        <div
          className="w-20 h-20 rounded-2xl bg-white/90 shadow-md flex items-center justify-center border border-white transition-transform duration-200 group-hover:scale-105"
          style={{ color: theme.accent }}
        >
          <IconComponent className="w-10 h-10" strokeWidth={1.75} />
        </div>
        <span className="mt-2.5 text-[11px] font-medium tracking-tight text-slate-600">
          {theme.tag}
        </span>
      </div>
    </div>
  );
};

export const BookingQrGraphic: React.FC<{ code: string; size?: number }> = ({
  code,
  size = 148,
}) => {
  const cells: boolean[] = [];
  for (let i = 0; i < 81; i++) {
    const charCode = code.charCodeAt(i % code.length) || 65;
    cells.push((charCode + i * 7) % 3 !== 0);
  }

  return (
    <div
      className="inline-flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200"
      aria-label={`QR Code for ${code}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 110 110"
        className="rounded-lg"
      >
        <rect width="110" height="110" fill="#FFFFFF" />
        <rect x="8" y="8" width="26" height="26" fill="none" stroke="#17172B" strokeWidth="4" />
        <rect x="14" y="14" width="14" height="14" fill="#1F9D55" />

        <rect x="76" y="8" width="26" height="26" fill="none" stroke="#17172B" strokeWidth="4" />
        <rect x="82" y="14" width="14" height="14" fill="#1F9D55" />

        <rect x="8" y="76" width="26" height="26" fill="none" stroke="#17172B" strokeWidth="4" />
        <rect x="14" y="82" width="14" height="14" fill="#1F9D55" />

        {cells.map((filled, idx) => {
          const row = Math.floor(idx / 9);
          const col = idx % 9;
          if ((row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3)) {
            return null;
          }
          const x = 10 + col * 10;
          const y = 10 + row * 10;
          return filled ? (
            <rect
              key={idx}
              x={x}
              y={y}
              width="7"
              height="7"
              rx="1.5"
              fill={idx % 5 === 0 ? '#1F9D55' : '#17172B'}
            />
          ) : null;
        })}
      </svg>
      <span className="mt-1.5 font-mono text-[11px] text-slate-600 tracking-wider">
        {code}
      </span>
    </div>
  );
};
