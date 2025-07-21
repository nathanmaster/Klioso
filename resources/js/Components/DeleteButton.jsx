import { useState } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function DeleteButton({ 
    resource, 
    resourceName, 
    deleteRoute, 
    variant = "outline",
    size = "sm",
    className = "",
    onSuccess 
}) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(deleteRoute, {
            onSuccess: () => {
                setDeleting(false);
                setShowConfirm(false);
                if (onSuccess) onSuccess();
            },
            onError: () => {
                setDeleting(false);
            }
        });
    };

    if (showConfirm) {
        return (
            <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                    Are you sure you want to delete this {resourceName}?
                </p>
                <div className="flex gap-2">
                    <Button
                        onClick={handleDelete}
                        disabled={deleting}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                    <Button
                        onClick={() => setShowConfirm(false)}
                        disabled={deleting}
                        size="sm"
                        variant="outline"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Button
            onClick={() => setShowConfirm(true)}
            variant={variant}
            size={size}
            className={`text-red-600 border-red-300 hover:bg-red-50 ${className}`}
        >
            Delete
        </Button>
    );
}
