interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    text?: string;
    className?: string;
}
export default function LoadingSpinner({ size, color, text, className, }: LoadingSpinnerProps): import("react/jsx-runtime").JSX.Element;
export declare function LoadingDots({ size, color, className, }: Omit<LoadingSpinnerProps, 'text'>): import("react/jsx-runtime").JSX.Element;
export declare function LoadingSkeleton({ className }: {
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
