import { useEffect, useState } from "react";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MAX_BENEFICIARIES = 7;

export function BeneficiaryLimitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: beneficiaries } = useBeneficiaries();
  const navigate = useNavigate();

  useEffect(() => {
    const activeBeneficiaries =
      beneficiaries && beneficiaries.filter((b) => b.isAlive);
    if (activeBeneficiaries.length >= MAX_BENEFICIARIES) {
      setIsOpen(true);
    }
  }, [beneficiaries]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Maximum Beneficiaries Reached
          </DialogTitle>
          <DialogDescription>
            You've reached the limit of {MAX_BENEFICIARIES} active
            beneficiaries.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            To add a new beneficiary, you'll need to either:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Remove an existing beneficiary</li>
            <li>Archive a beneficiary who is no longer eligible</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              setIsOpen(false);
              navigate("/profile");
            }}
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
