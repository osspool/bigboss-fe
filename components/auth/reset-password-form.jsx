// components/auth/reset-password-form.jsx
"use client"
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(false);

  // Simple password strength calculation
  const calculateStrength = (pass) => {
    if (!pass) return 0;
    
    let strength = 0;
    // Length check
    if (pass.length >= 8) strength += 25;
    else if (pass.length >= 6) strength += 15;
    
    // Complexity checks
    if (/[A-Z]/.test(pass)) strength += 25; // Has uppercase
    if (/[0-9]/.test(pass)) strength += 25; // Has number
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25; // Has special char
    
    return Math.min(100, strength);
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = () => {
    if (strength < 30) return "bg-destructive";
    if (strength < 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = () => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-full transition-colors duration-200",
            focused ? "bg-primary/15 text-primary" : "text-muted-foreground"
          )}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <Label
            htmlFor="password"
            className={cn(
              "font-medium text-sm transition-colors duration-200",
              focused ? "text-primary" : "text-foreground"
            )}
          >
            New Password
          </Label>
        </div>
        
        <div className="relative">
          <Input
            className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 pr-10 transition-all duration-200"
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
              focused ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {password && (
          <div className="space-y-2 animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-300", getStrengthColor())} 
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {getStrengthText()}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Use at least 6 characters with a mix of letters, numbers & symbols
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <Label
            htmlFor="confirmPassword"
            className="font-medium text-sm text-foreground"
          >
            Confirm Password
          </Label>
        </div>
        
        <Input
          className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          required
        />
      </div>
    </div>
  );
}