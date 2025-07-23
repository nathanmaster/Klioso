import { useState } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

export default function InputModal({ 
    show, 
    onClose, 
    onSubmit, 
    title = 'Input Required', 
    label = 'Value',
    placeholder = '',
    initialValue = '',
    submitText = 'Submit',
    cancelText = 'Cancel',
    type = 'text' // 'text', 'email', 'number', etc.
}) {
    const [value, setValue] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
        onClose();
        setValue('');
    };

    const handleClose = () => {
        onClose();
        setValue('');
    };

    return (
        <Modal show={show} onClose={handleClose} title={title}>
            <form onSubmit={handleSubmit}>
                <div className="mt-2">
                    <label htmlFor="input-value" className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <input
                        type={type}
                        id="input-value"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                    >
                        {submitText}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
