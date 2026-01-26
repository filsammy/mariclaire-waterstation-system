import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {

        // Mobile-first styles: Touch targets min 44px
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 touch-manipulation";

        const variants = {
            primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
            danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
            ghost: "hover:bg-gray-100 text-gray-700",
            outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700"
        };

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-4 text-base", // Default is large enough for standard mobile tap
            lg: "h-14 px-8 text-lg",
            icon: "h-11 w-11"
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(baseStyles, variants[variant], sizes[size], isLoading && "cursor-wait", className)}
                {...props}
            >
                {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
