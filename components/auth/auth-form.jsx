import Form from "next/form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { ResetPasswordForm } from "./reset-password-form";
import { cn } from "@/lib/utils";

export function AuthForm({
    formType = "login",
    action,
    children,
    defaultEmail = "",
    onValidityChange,
    className,
}) {
    const formComponents = {
        login: LoginForm,
        register: RegisterForm,
        resetpass: ResetPasswordForm,
        forgetpass: ForgotPasswordForm,
    };

    const FormComponent = formComponents[formType];

    if (!FormComponent) {
        return null;
    }

    return (
        <Form 
            action={action} 
            className={cn(
                "animate-in fade-in-50 duration-300",
                className
            )}
        >
            <div className=" relative">
                <FormComponent 
                    defaultEmail={defaultEmail} 
                    onValidityChange={onValidityChange}
                />
            </div>
            
            <div className="">
                {children}
            </div>
        
        </Form>
    );
}