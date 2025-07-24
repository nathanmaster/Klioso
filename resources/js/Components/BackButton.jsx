import { router } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function BackButton({ 
    fallbackRoute = null, 
    variant = "outline", 
    size = "sm", 
    className = "" 
}) {
    const handleBack = () => {
        // Check if there's browser history to go back to
        if (window.history.length > 1) {
            window.history.back();
        } else if (fallbackRoute) {
            // If no history, use fallback route
            router.get(fallbackRoute);
        } else {
            // Default fallback to dashboard
            router.get('/dashboard');
        }
    };

    return (
        <Button
            onClick={handleBack}
            variant={variant}
            size={size}
            className={className}
        >
            ← Back
        </Button>
    );
}
