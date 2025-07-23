import Modal from '@/Components/Modal';
import Button from '@/Components/Button';

export default function ConfirmationModal({ 
    show, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger', 'warning', 'info'
}) {
    const buttonClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    };

    return (
        <Modal show={show} onClose={onClose} title={title}>
            <div className="mt-2">
                <p className="text-sm text-gray-600">
                    {message}
                </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                >
                    {cancelText}
                </Button>
                <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClasses[type]}`}
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
