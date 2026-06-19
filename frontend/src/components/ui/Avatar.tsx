import React from 'react';
import { User } from 'lucide-react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  };

  // Determine if src is a local path or external URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  const imageUrl = src ? (src.startsWith('http') ? src : `${baseUrl}${src}`) : null;

  return (
    <div
      className={clsx(
        'rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-xl transition-all relative',
        sizeClasses[size],
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || 'User'}
          className="w-full h-full object-cover"
          key={imageUrl} // Force re-render on change
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Show icon fallback on error
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.avatar-fallback')) {
                const icon = document.createElement('div');
                icon.className = 'avatar-fallback';
                parent.appendChild(icon);
            }
          }}
        />
      ) : (
        <User size={iconSizes[size]} className="text-slate-500" />
      )}
    </div>
  );
};

export default Avatar;
