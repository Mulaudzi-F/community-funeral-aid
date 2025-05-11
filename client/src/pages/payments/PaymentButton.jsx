import { Button } from "@/components/ui/button";
import { Loader2, Banknote } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { useAuth } from "@/contexts/useAuth";

export function PaymentButton({ deathReportId }) {
  const { mutate: initiatePayment, isPending } = usePayment(deathReportId);
  const { user } = useAuth();

  return (
    <Button onClick={() => initiatePayment()} disabled={isPending || !user}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Banknote className="mr-2 h-4 w-4" />
          Pay ZAR 20
        </>
      )}
    </Button>
  );
}
