import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

export function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Payment cancelled",
      description: "Your payment was not completed.",
      variant: "destructive",
    });
  }, [toast]);

  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center">
      <XCircle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground mb-6">
        Your contribution payment was not completed. You can try again if you
        wish.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
