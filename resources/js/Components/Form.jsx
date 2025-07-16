import React from 'react';

function Input({ label, error, helper, ...props }) {
    return (
        <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            <input className={`mt-1 block w-full rounded border-gray-300 shadow-sm ${error ? 'border-red-500' : ''}`} {...props} />
            {helper && <span className="text-xs text-gray-400">{helper}</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </label>
    );
}

function Textarea({ label, error, helper, ...props }) {
    return (
        <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            <textarea className={`mt-1 block w-full rounded border-gray-300 shadow-sm ${error ? 'border-red-500' : ''}`} {...props} />
            {helper && <span className="text-xs text-gray-400">{helper}</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </label>
    );
}

function Checkbox({ label, error, ...props }) {
    return (
        <label className="inline-flex items-center mb-4">
            <input type="checkbox" className={`rounded border-gray-300 ${error ? 'border-red-500' : ''}`} {...props} />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
            {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
        </label>
    );
}

export default function Form({ children, ...props }) {
    return <form {...props} className="space-y-4">{children}</form>;
}

Form.Input = Input;
Form.Textarea = Textarea;
Form.Checkbox = Checkbox;
