// components/auth/forgot-password-form.jsx
import { Mail } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({ defaultEmail = "", onValidityChange }) {
    const [focused, setFocused] = useState(false);
    const [email, setEmail] = useState(defaultEmail);

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        // Optional: Add email validation and call onValidityChange if provided
        if (onValidityChange) {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
            onValidityChange(isValid);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className={cn(
                    "p-1.5 rounded-full transition-colors duration-200",
                    focused ? "bg-primary/15 text-primary" : "text-muted-foreground"
                )}>
                    <Mail className="w-4 h-4" />
                </div>
                <Label 
                    htmlFor="email" 
                    className={cn(
                        "font-medium text-sm transition-colors duration-200",
                        focused ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    Email Address
                </Label>
            </div>
            
            <div className="relative">
                <Input
                    id="email"
                    name="email"
                    className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    type="email"
                    placeholder="user@mail.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                
                <div className={cn(
                    "absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-0 transition-opacity duration-300",
                    email && email.includes('@') && email.includes('.') ? "opacity-100" : "opacity-0"
                )}>
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
                {"We'll send a password reset link to this email address."}
            </p>
        </div>
    );
}