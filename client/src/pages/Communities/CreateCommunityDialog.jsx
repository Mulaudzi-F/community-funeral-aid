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
import { CreateCommunityForm } from "./CreateCommunityForm";
import { PlusCircle } from "lucide-react";

export function CreateCommunityDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Fill out the form below to register a new community. Click create
            when you're done.
          </DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
