import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        // Get theme from localStorage or default to system
        const savedTheme = localStorage.getItem('theme') || 'system';
        setTheme(savedTheme);
        applyTheme(savedTheme);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const currentTheme = localStorage.getItem('theme') || 'system';
            if (currentTheme === 'system') {
                applyTheme('system');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []); // Remove theme from dependencies to avoid infinite loops

    const applyTheme = (newTheme) => {
        console.log('applyTheme called with:', newTheme);
        const root = document.documentElement;
        console.log('Current HTML classList before:', root.classList.toString());
        
        if (newTheme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            console.log('Applied dark theme');
        } else if (newTheme === 'light') {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            console.log('Applied light theme');
        } else {
            // System theme
            localStorage.setItem('theme', 'system');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
                console.log('Applied system dark theme');
            } else {
                root.classList.remove('dark');
                console.log('Applied system light theme');
            }
        }
        setTheme(newTheme);
        console.log('New theme state:', newTheme);
        console.log('HTML classList after:', root.classList.toString());
    };

    const getIcon = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (theme === 'dark' || (theme === 'system' && isDark)) {
            return <Moon className="h-4 w-4" />;
        } else if (theme === 'light' || (theme === 'system' && !isDark)) {
            return <Sun className="h-4 w-4" />;
        } else {
            return <Monitor className="h-4 w-4" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 px-0"
                    aria-label={`Current theme: ${theme}. Click to change theme.`}
                >
                    {getIcon()}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label="Theme selection">
                <DropdownMenuItem onClick={() => {
                    console.log('Light theme clicked');
                    applyTheme('light');
                }}>
                    <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    console.log('Dark theme clicked');
                    applyTheme('dark');
                }}>
                    <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    console.log('System theme clicked');
                    applyTheme('system');
                }}>
                    <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
