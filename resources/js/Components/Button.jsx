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
        "inline-flex items-center justify-center font-medium rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800";
    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };
    
    const variants = {
        primary: disabled || loading
            ? "bg-blue-300 dark:bg-blue-700 text-white cursor-not-allowed"
            : "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600",
        outline: disabled || loading
            ? "border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
        ghost: disabled || loading
            ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
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
