import React from 'react';

function Input({ label, error, helper, id, ...props }) {
    const helperId = helper ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="block mb-4" htmlFor={id}>
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            <input 
                id={id}
                className={`mt-1 block w-full rounded border-gray-300 shadow-sm ${error ? 'border-red-500' : ''}`} 
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props} 
            />
            {helper && <span id={helperId} className="text-xs text-gray-400">{helper}</span>}
            {error && <span id={errorId} className="text-xs text-red-500">{error}</span>}
        </label>
    );
}

function Textarea({ label, error, helper, id, ...props }) {
    const helperId = helper ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="block mb-4" htmlFor={id}>
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            <textarea 
                id={id}
                className={`mt-1 block w-full rounded border-gray-300 shadow-sm ${error ? 'border-red-500' : ''}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props} 
            />
            {helper && <span id={helperId} className="text-xs text-gray-400">{helper}</span>}
            {error && <span id={errorId} className="text-xs text-red-500">{error}</span>}
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
                className={`rounded border-gray-300 ${error ? 'border-red-500' : ''}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props} 
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
            {error && <span id={errorId} className="ml-2 text-xs text-red-500">{error}</span>}
        </label>
    );
}

function Select({ label, error, helper, children, id, ...props }) {
    const helperId = helper ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
        <label className="block mb-4" htmlFor={id}>
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            <select
                id={id}
                className={`mt-1 block w-full rounded border-gray-300 shadow-sm ${error ? 'border-red-500' : ''}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                {...props}
            >
                {children}
            </select>
            {helper && <span id={helperId} className="text-xs text-gray-400">{helper}</span>}
            {error && <span id={errorId} className="text-xs text-red-500">{error}</span>}
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
