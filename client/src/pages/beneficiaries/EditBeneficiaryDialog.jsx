import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditBeneficiaryForm } from "./EditBeneficiaryForm";
import { Pencil } from "lucide-react";

export function EditBeneficiaryDialog({ beneficiary }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Beneficiary</DialogTitle>
          <DialogDescription>
            Update the details for {beneficiary.firstName}{" "}
            {beneficiary.lastName}
          </DialogDescription>
        </DialogHeader>
        <EditBeneficiaryForm
          beneficiary={beneficiary}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
