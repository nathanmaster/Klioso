import React from 'react';

export default function Button({
    as: Component = 'button',
    children,
    icon,
    loading = false,
    disabled = false,
    size = 'md',
    variant = 'primary',
    className = '',
    ...props
}) {
    const base =
        "inline-flex items-center justify-center font-medium rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };
    
    const variants = {
        primary: disabled || loading
            ? "bg-blue-300 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700",
        outline: disabled || loading
            ? "border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        ghost: disabled || loading
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    };
    
    return (
        <Component
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {loading ? "Loading..." : children}
        </Component>
    );
}
