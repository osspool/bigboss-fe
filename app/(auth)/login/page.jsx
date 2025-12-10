"use client";

import { KeyRound, LogIn, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, Suspense } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import { Button } from "@/components/ui/button";

import AuthContainer from "@/components/auth/auth-container";
// import { GoogleIcon } from "@/components/custom/ui/soical-icons";
import { login } from "../actions";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [isValid, setIsValid] = useState(true); // Default to true, HTML5 validation handles required fields
    const [loginAttempt, setLoginAttempt] = useState(0);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const [state, formAction] = useActionState(login, {
        status: "idle",
    });

    const isLoading = state.status === "in_progress";

    useEffect(() => {
        if (loginAttempt > 0) {
            if (state.status === "failed") {
                toast.error("Invalid credentials!");
            } else if (state.status === "invalid_data") {
                toast.error("Failed validating your submission!");
            } else if (state.status === "success") {
                toast.success("Login successful!");
                // Navigate to dashboard (or callback URL) - the route will handle session refresh
                router.push(callbackUrl);
            }
        }
    }, [state.status, loginAttempt, router, callbackUrl]);

    const handleSubmit = (formData) => {
        setEmail(formData.get("email"));
        setLoginAttempt((prev) => prev + 1);
        formAction(formData);
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            const result = await signIn("google", {
                redirect: false,
                callbackUrl: callbackUrl,
            });

            if (result?.error) {
                toast.error("Google login failed!");
            } else {
                router.refresh();
                toast.success("Google login successful!");
                if (callbackUrl) {
                    router.push(callbackUrl);
                }
            }
        } catch (error) {
            toast.error("Google login failed!");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <AuthContainer
            title="Welcome Back"
            description="Use your email and password to sign in"
            icon={<LogIn className="w-6 h-6 text-retro-primary" />}
        >
            <AuthForm
                action={handleSubmit}
                defaultEmail={email}
                onValidityChange={setIsValid}
            >
                <div className="mt-10 flex flex-col gap-3">
                    <SubmitButton
                        disabled={!isValid || isLoading}
                        className="w-full"
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign in
                    </SubmitButton>

                    {/* <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full retro-button retro-button-secondary"
                    >
                        <GoogleIcon />
                        <span className="ml-2">Sign in with Google</span>
                    </Button> */}
                </div>
            </AuthForm>

            <div className="w-full flex items-center gap-2 my-6">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border"></div>
            </div>

            <Link href="/register" className="w-full">
                <Button
                    variant="outline"
                    className="w-full group border-retro-border hover:bg-retro-secondary/10"
                >
                    <UserPlus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    Create an account
                </Button>
            </Link>

            <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 
            flex items-center justify-center gap-2 mt-4 group"
            >
                <KeyRound className="w-4 h-4 group-hover:text-retro-primary transition-colors" />
                <span className="group-hover:underline underline-offset-2">
                    Forgot your password?
                </span>
            </Link>
        </AuthContainer>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <AuthContainer
                title="Welcome Back"
                description="Use your email and password to sign in"
                icon={<LogIn className="w-6 h-6 text-retro-primary" />}
            >
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-retro-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </AuthContainer>
        }>
            <LoginContent />
        </Suspense>
    );
}
