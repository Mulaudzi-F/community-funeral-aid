import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/useAuth";

export const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  //const { mutate: verifyEmail } = useVerifyEmail();

  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");

    if (success === "true") {
      setStatus("success");
      return;
    }

    if (success === "false") {
      setStatus("error");
      return;
    }

    if (token) {
      setStatus("loading");
      verifyEmail(token, {
        onSuccess: () => {
          setStatus("success");
          // Remove token from URL
          navigate("/verify-email?success=true", { replace: true });
        },
        onError: () => {
          setStatus("error");
          navigate("/verify-email?success=false", { replace: true });
        },
      });
    }
  }, [searchParams, navigate, verifyEmail]);

  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "idle" && (
            <>
              <p className="text-center">
                We've sent a verification email to your address. Please check
                your inbox and click the verification link.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive an email? Check your spam folder or request a new
                verification email.
              </p>
            </>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 text-green-600">
              <CheckCircle2 className="h-12 w-12" />
              <p className="text-center">
                Your email has been successfully verified!
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 text-destructive">
              <XCircle className="h-12 w-12" />
              <p className="text-center">
                The verification link is invalid or has expired. Please request
                a new verification email.
              </p>
            </div>
          )}
        </CardContent>
        {status === "idle" || status === "error" ? (
          <CardFooter className="flex justify-center">
            <ResendVerificationButton />
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
};

const ResendVerificationButton = () => {
  //   const { mutate: resendVerification, isLoading } =
  //     useResendVerificationEmail();

  const {
    resendVerificationEmail: resendVerification,
    isResendingVerificationEmail: isLoading,
  } = useAuth();

  const handleResend = () => {
    resendVerification(undefined, {
      onSuccess: () => {
        toast.message("Verification email sent", {
          description: "Please check your inbox for the verification link.",
        });
      },
      onError: (error) => {
        toast.message("Error sending verification email", {
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Button onClick={handleResend} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Resend Verification Email"
      )}
    </Button>
  );
};
