import React from 'react';
import collaboratoLogoLight from '../../assets/collaborato-logo-light.png';
import collaboratoLogoDark from '../../assets/collaborato-logo-dark.png';
import collaboratoLogoSvg from '../../assets/collaborato-logo.svg';

interface LogoProps {
  /** Theme variant of the logo */
  variant?: 'light' | 'dark' | 'svg';
  /** Size of the logo */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show logo text */
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
};

const Logo: React.FC<LogoProps> = ({ 
  variant = 'svg', 
  size = 'md', 
  className = '', 
  showText = false 
}) => {
  const getLogoSrc = () => {
    switch(variant) {
      case 'light':
        return collaboratoLogoLight;
      case 'dark':
        return collaboratoLogoDark;
      case 'svg':
      default:
        return collaboratoLogoSvg;
    }
  };
  
  const logoSrc = getLogoSrc();
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoSrc} 
        alt="Collaborato" 
        className={`${sizeClass} object-contain`}
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          filter: variant === 'svg' ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : undefined
        }}
      />
      {showText && (
        <span className={`ml-3 font-bold tracking-tight ${textSizeClass}`}>
          Collaborato
        </span>
      )}
    </div>
  );
};

export default Logo;