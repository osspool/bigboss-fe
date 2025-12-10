// ResetPage.jsx
import { Suspense } from "react";
import AuthContainer from "@/components/auth/auth-container";
import ResetPasswordClient from "./reset-password-client";
import { KeyRound, Loader2 } from "lucide-react";

async function ResetContent(props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  return (
    <AuthContainer
      title="Reset Your Password"
      description="Enter your new password below to regain access to your account."
      icon={<KeyRound className="w-6 h-6 text-retro-primary" />}
    >
      <ResetPasswordClient token={token} />
    </AuthContainer>
  );
}

export default function ResetPage(props) {
  return (
    <Suspense fallback={
      <AuthContainer
        title="Reset Your Password"
        description="Enter your new password below to regain access to your account."
        icon={<KeyRound className="w-6 h-6 text-retro-primary" />}
      >
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-retro-primary" />
        </div>
      </AuthContainer>
    }>
      <ResetContent {...props} />
    </Suspense>
  );
}
