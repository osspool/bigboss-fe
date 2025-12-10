// components/auth/login-form.jsx
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginForm({ defaultEmail = "", onValidityChange }) {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [focused, setFocused] = useState(null);

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        // Always consider the password valid regardless of length
        onValidityChange?.(true);
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "p-1.5 rounded-full transition-colors duration-200",
                            focused === "email"
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Mail className="w-4 h-4" />
                    </div>
                    <Label
                        htmlFor="email"
                        className={cn(
                            "font-medium text-sm transition-colors duration-200",
                            focused === "email"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Email Address
                    </Label>
                </div>
                <Input
                    id="email"
                    name="email"
                    className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    type="email"
                    placeholder="user@mail.com"
                    autoComplete="email"
                    required
                    defaultValue={defaultEmail}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "p-1.5 rounded-full transition-colors duration-200",
                            focused === "password"
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Lock className="w-4 h-4" />
                    </div>
                    <Label
                        htmlFor="password"
                        className={cn(
                            "font-medium text-sm transition-colors duration-200",
                            focused === "password"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Password
                    </Label>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 pr-10 transition-all duration-200"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={() => setFocused("password")}
                        onBlur={() => setFocused(null)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                            focused === "password"
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {/* {password && password.length < 6 && (
                    <p className="text-xs text-destructive mt-1 animate-in fade-in-50">
                        Password must be at least 6 characters
                    </p>
                )} */}
            </div>
        </div>
    );
}
