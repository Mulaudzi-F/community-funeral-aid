import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Payment successful",
      description: "Thank you for your contribution to the family.",
    });
  }, [toast]);

  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center">
      <CheckCircle2 className="h-16 w-16 text-success mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your ZAR 20 contribution. Your payment has been processed
        successfully.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate("/death-reports")}>
          View Death Reports
        </Button>
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
