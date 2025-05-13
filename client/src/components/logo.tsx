import { useTheme } from "@/hooks/use-theme";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'small' | 'normal';
}

export function Logo({ className = '', showText = true, size = 'normal' }: LogoProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const logoSize = size === 'small' ? 'w-7 h-7' : 'w-9 h-9';
  const textSize = size === 'small' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center justify-center ${logoSize} bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20`}>
      <svg 
          width="24" 
          height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
          className="text-white"
        >
          <path 
            d="M12 2L4 6.5M12 2L20 6.5M12 2V19M20 6.5V17.5L12 22M20 6.5L12 11M4 6.5L12 11M4 6.5V17.5L12 22M12 11V19" 
        stroke="currentColor" 
            strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span 
          className={`ml-3 font-bold ${textSize} ${isDarkMode ? 'text-white' : 'text-blue-600'}`}
        >
          Dashly
        </span>
      )}
    </div>
  );
}
