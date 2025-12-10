"use client";

import { Loader2, LogIn, UserPlus } from "lucide-react";
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
import { register } from "../actions";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const [email, setEmail] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [registerAttempt, setRegisterAttempt] = useState(0);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const [state, formAction] = useActionState(register, {
        status: "idle",
    });

    const isLoading = state.status === "in_progress";

    useEffect(() => {
        if (registerAttempt > 0) {
            if (state.status === "user_exists") {
                toast.error("Account already exists");
            } else if (state.status === "failed") {
                toast.error(state.error || "Failed to create account");
            } else if (state.status === "invalid_data") {
                if (state.errors) {
                    // Display each validation error as a separate toast
                    Object.entries(state.errors).forEach(([field, message]) => {
                        toast.error(
                            `${
                                field.charAt(0).toUpperCase() + field.slice(1)
                            }: ${message}`
                        );
                    });
                } else {
                    toast.error("Failed validating your submission!");
                }
            } else if (state.status === "success") {
                toast.success(state.message || "Account created successfully");
                router.push("/login");
            }
        }
    }, [state, registerAttempt, router]);

    const handleSubmit = (formData) => {
        setEmail(formData.get("email"));
        setRegisterAttempt((prev) => prev + 1);
        formAction(formData);
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            const result = await signIn("google", {
                redirect: false,
                callbackUrl: callbackUrl || "/",
            });

            if (result?.error) {
                toast.error("Google sign up failed!");
            } else {
                router.refresh();
                toast.success("Google sign up successful!");
                if (callbackUrl) {
                    router.push(callbackUrl);
                }
            }
        } catch (error) {
            toast.error("Google sign up failed!");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <AuthContainer
            title="Create Account"
            description="Join us to get started with your new account"
            icon={<UserPlus className="w-6 h-6" />}
            className="animate-fade-in"
        >
            <AuthForm
                formType="register"
                action={handleSubmit}
                defaultEmail={email}
                onValidityChange={setIsValid}
            >
                <div className="mt-10 flex flex-col gap-3 hover:cursor-pointer">
                    <SubmitButton
                        disabled={!isValid || isLoading}
                        className="w-full "
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Sign up
                            </>
                        )}
                    </SubmitButton>

                    {/* <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full retro-button retro-button-secondary"
                    >
                        <GoogleIcon />
                        <span className="ml-2">Sign up with Google</span>
                    </Button> */}
                </div>
            </AuthForm>

            <div className="w-full flex items-center gap-2 my-6">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border"></div>
            </div>

            <Link href="/login" className="w-full hover:cursor-pointer">
                <Button
                    variant="outline"
                    className="w-full group border-retro-border hover:bg-retro-secondary/10"
                >
                    <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    Sign in to existing account
                </Button>
            </Link>

            <div className="text-xs text-center text-muted-foreground mt-4">
                By creating an account, you agree to our
                <Link
                    href="/terms"
                    className="text-retro-primary hover:underline mx-1"
                >
                    Terms of Service
                </Link>
                and
                <Link
                    href="/privacy"
                    className="text-retro-primary hover:underline mx-1"
                >
                    Privacy Policy
                </Link>
            </div>
        </AuthContainer>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <AuthContainer
                title="Create Account"
                description="Join us to get started with your new account"
                icon={<UserPlus className="w-6 h-6" />}
            >
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-retro-primary" />
                </div>
            </AuthContainer>
        }>
            <RegisterForm />
        </Suspense>
    );
}
