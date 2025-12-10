// components/auth/register-form.jsx
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { PhoneInput as IntlPhoneInput } from "@/components/custom/ui/phone-input";
import { Suspense, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function RegisterFormContent({ defaultEmail = "", onValidityChange }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focused, setFocused] = useState(null);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [formValues, setFormValues] = useState({
        name: "",
        email: defaultEmail,
        phone: "",
        password: "",
        password2: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Check if all required fields are filled and passwords match
        const isValid =
            formValues.name.length >= 3 &&
            formValues.email.includes("@") &&
            Boolean(formValues.phone && formValues.phone.length > 4) &&
            formValues.password.length >= 6 &&
            formValues.password === formValues.password2;

        if (onValidityChange) {
            onValidityChange(isValid);
        }
    }, [formValues, onValidityChange]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let nextValue = value;
        setFormValues((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        if (name === "password") {
            setPassword(value);
        } else if (name === "password2") {
            setPassword2(value);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name Field */}
            <div className="space-y-2 md:col-span-1">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "p-1.5 rounded-full transition-colors duration-200",
                            focused === "name"
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <User className="w-4 h-4" />
                    </div>
                    <Label
                        htmlFor="name"
                        className={cn(
                            "font-medium text-sm transition-colors duration-200",
                            focused === "name"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Full Name
                    </Label>
                </div>
                <Input
                    id="name"
                    name="name"
                    className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    value={formValues.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                />
            </div>

            {/* Email Field */}
            <div className="space-y-2 md:col-span-1">
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
                    value={formValues.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                />
            </div>

            {/* Phone Field (Bangladesh default) */}
            <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "p-1.5 rounded-full transition-colors duration-200",
                            focused === "phone"
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Phone className="w-4 h-4" />
                    </div>
                    <Label
                        htmlFor="phone"
                        className={cn(
                            "font-medium text-sm transition-colors duration-200",
                            focused === "phone"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Phone Number
                    </Label>
                </div>
                <IntlPhoneInput
                    value={formValues.phone}
                    onChange={(val) =>
                        setFormValues((prev) => ({ ...prev, phone: val || "" }))
                    }
                    defaultCountry="BD"
                    placeholder="Enter phone number"
                    onFocus={() => setFocused("phone")}
                    onBlur={() => setFocused(null)}
                    required
                />
            </div>

            {/* Password Field */}
            <div className="space-y-2 md:col-span-1">
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
                        placeholder="••••••••"
                        required
                        value={formValues.password}
                        onChange={handleInputChange}
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

                {/* Password Requirements Hint */}
                <div
                    className={cn(
                        "text-xs flex items-center gap-1.5 transition-colors duration-200",
                        password.length >= 6
                            ? "text-green-500"
                            : "text-muted-foreground"
                    )}
                >
                    <div
                        className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                            password.length >= 6
                                ? "bg-green-500"
                                : "bg-muted-foreground"
                        )}
                    />
                    Password must be at least 6 characters long
                </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2 md:col-span-1">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "p-1.5 rounded-full transition-colors duration-200",
                            focused === "password2"
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Lock className="w-4 h-4" />
                    </div>
                    <Label
                        htmlFor="password2"
                        className={cn(
                            "font-medium text-sm transition-colors duration-200",
                            focused === "password2"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Confirm Password
                    </Label>
                </div>
                <div className="relative">
                    <Input
                        id="password2"
                        name="password2"
                        className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 pr-10 transition-all duration-200"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={formValues.password2}
                        onChange={handleInputChange}
                        onFocus={() => setFocused("password2")}
                        onBlur={() => setFocused(null)}
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                            focused === "password2"
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={
                            showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Password Match Hint */}
                {password && password2 && (
                    <div
                        className={cn(
                            "text-xs flex items-center gap-1.5 transition-colors duration-200",
                            password === password2
                                ? "text-green-500"
                                : "text-red-500"
                        )}
                    >
                        <div
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                                password === password2
                                    ? "bg-green-500"
                                    : "bg-red-500"
                            )}
                        />
                        {password === password2
                            ? "Passwords match"
                            : "Passwords do not match"}
                    </div>
                )}
            </div>
        </div>
    );
}



export function RegisterForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterFormContent />
        </Suspense>
    );
}
