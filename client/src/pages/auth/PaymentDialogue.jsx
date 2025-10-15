import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

export function PaymentDialog({ open, onOpenChange, paymentData, onComplete }) {
  const [status, setStatus] = useState("pending");
  const [isChecking, setIsChecking] = useState(false);

  const checkPaymentStatus = async () => {
    setIsChecking(true);
    try {
      const response = await api.get(
        `/payments/status/${paymentData.reference}`
      );

      if (response.data.data.status === "completed") {
        setStatus("completed");
        onComplete();
      } else {
        setTimeout(checkPaymentStatus, 3000); // Poll every 3 seconds
      }
    } catch (error) {
      toast("Error checking payment", {
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (open && paymentData) {
      setStatus("pending");
    }
  }, [open, paymentData]);

  const handleOpenChange = (isOpen) => {
    if (status === "completed") {
      onOpenChange(false);
    } else {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            {status === "pending"
              ? "Please complete the R50 payment to activate your account."
              : "Your payment has been successfully processed!"}
          </DialogDescription>
        </DialogHeader>

        {status === "pending" ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-secondary">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount Due:</span>
                <span className="font-bold">
                  R{paymentData?.amount.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {paymentData?.description}
              </div>
            </div>

            <Button
              asChild
              className="w-full"
              onClick={() => window.open(paymentData?.paymentUrl, "_blank")}
            >
              <a
                href={paymentData?.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Proceed to PayFast
              </a>
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              After completing payment, keep this window open for verification.
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={checkPaymentStatus}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Payment...
                </>
              ) : (
                "I've Completed Payment"
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-medium">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your account is being activated. You can now log in.
            </p>
            <Button className="mt-6" onClick={() => handleOpenChange(false)}>
              Continue to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
