import React from 'react';

function Input({ label, error, helper, id, ...props }) {
    const helperId = helper ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="block mb-4" htmlFor={id}>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <input 
                id={id}
                className={`mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${error ? 'border-red-500 dark:border-red-400' : ''}`} 
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props} 
            />
            {helper && <span id={helperId} className="text-xs text-gray-400 dark:text-gray-500">{helper}</span>}
            {error && <span id={errorId} className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </label>
    );
}

function Textarea({ label, error, helper, id, ...props }) {
    const helperId = helper ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="block mb-4" htmlFor={id}>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <textarea 
                id={id}
                className={`mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${error ? 'border-red-500 dark:border-red-400' : ''}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props} 
            />
            {helper && <span id={helperId} className="text-xs text-gray-400 dark:text-gray-500">{helper}</span>}
            {error && <span id={errorId} className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </label>
    );
}

function Checkbox({ label, error, id, 'aria-describedby': ariaDescribedBy, ...props }) {
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="inline-flex items-center mb-4" htmlFor={id}>
            <input 
                id={id}
                type="checkbox" 
                className={`rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 ${error ? 'border-red-500 dark:border-red-400' : ''}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props} 
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{label}</span>
            {error && <span id={errorId} className="ml-2 text-xs text-red-500 dark:text-red-400">{error}</span>}
        </label>
    );
}

function Select({ label, error, helper, children, id, ...props }) {
    const helperId = helper ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="block mb-4" htmlFor={id}>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <select
                id={id}
                className={`mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${error ? 'border-red-500 dark:border-red-400' : ''}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props}
            >
                {children}
            </select>
            {helper && <span id={helperId} className="text-xs text-gray-400 dark:text-gray-500">{helper}</span>}
            {error && <span id={errorId} className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </label>
    );
}

export default function Form({ children, ...props }) {
    return <form {...props} className="space-y-4">{children}</form>;
}

Form.Input = Input;
Form.Textarea = Textarea;
Form.Checkbox = Checkbox;
Form.Select = Select;
