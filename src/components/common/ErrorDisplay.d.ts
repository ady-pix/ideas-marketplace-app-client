import type { ReactNode } from 'react';
interface ErrorAction {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'danger';
}
interface ErrorDisplayProps {
    title?: string;
    message: string;
    icon?: ReactNode;
    actions?: ErrorAction[];
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}
export default function ErrorDisplay({ title, message, icon, actions, className, size, }: ErrorDisplayProps): import("react/jsx-runtime").JSX.Element;
export declare function NetworkErrorDisplay({ onRetry, backUrl, size, }: {
    onRetry?: () => void;
    backUrl?: string;
    size?: 'sm' | 'md' | 'lg';
}): import("react/jsx-runtime").JSX.Element;
export declare function NotFoundErrorDisplay({ itemName, backUrl, size, }: {
    itemName?: string;
    backUrl?: string;
    size?: 'sm' | 'md' | 'lg';
}): import("react/jsx-runtime").JSX.Element;
export declare function UnauthorizedErrorDisplay({ backUrl, size, }: {
    backUrl?: string;
    size?: 'sm' | 'md' | 'lg';
}): import("react/jsx-runtime").JSX.Element;
export declare function LoadingErrorDisplay({ onRetry, backUrl, itemName, size, }: {
    onRetry?: () => void;
    backUrl?: string;
    itemName?: string;
    size?: 'sm' | 'md' | 'lg';
}): import("react/jsx-runtime").JSX.Element;
export {};
