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
import { CreateSectionForm } from "./CreateSectionForm";
import { PlusCircle } from "lucide-react";

export function CreateSectionDialog({ communityId, onSectionCreated }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSectionCreated) onSectionCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Section</DialogTitle>
          <DialogDescription>
            Add a new section to your community. Sections help organize members
            geographically or by other criteria.
          </DialogDescription>
        </DialogHeader>
        <CreateSectionForm
          communityId={communityId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
