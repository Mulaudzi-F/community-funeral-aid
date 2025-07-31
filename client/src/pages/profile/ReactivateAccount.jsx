import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { PaymentDialog } from "../auth/PaymentDialog";
import { toast } from "sonner";
import { useReactivateAccount } from "@/hooks/usePayment";

export function ReactivateAccount() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const { mutate: initiateReactivation, isPending } = useReactivateAccount();

  const handlePaymentComplete = () => {
    toast("Payment successful", {
      description: "Your account is being reactivated.",
    });
    window.location.reload();
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Reactivate Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Reactivation</DialogTitle>
            <DialogDescription>
              Your account is suspended due to missed payments. To reactivate,
              please pay the R40 reactivation fee.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-destructive/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <h4 className="font-medium">Suspended Account</h4>
                  <p className="text-sm text-muted-foreground">
                    While suspended, you cannot access services or receive
                    benefits.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => initiateReactivation()}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay R40 Reactivation Fee"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        paymentData={paymentData}
        onComplete={handlePaymentComplete}
      />
    </>
  );
}
