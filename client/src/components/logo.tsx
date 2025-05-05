import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <svg 
        className={cn("text-blue-500 dark:text-blue-400", sizeClasses[size])} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M10 3H3v18h18v-7"/>
        <path d="M21 3h-6v6h6V3z" className="text-blue-600 dark:text-blue-300" fill="currentColor" strokeWidth="1" />
        <path d="M8 14l2.5 2.5L16 10" className="text-green-500 dark:text-green-400" />
        <path d="M18 16l3-3" className="text-green-500 dark:text-green-400" />
      </svg>
      <span className={cn("font-bold text-foreground tracking-tight", textSizeClasses[size])}>Dashly</span>
    </div>
  );
}
