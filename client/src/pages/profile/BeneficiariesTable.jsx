import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pen, Trash2, User } from "lucide-react";
import { useDeleteBeneficiary } from "@/hooks/useBeneficiaries";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

export const BeneficiariesTable = ({ beneficiaries }) => {
  const navigate = useNavigate();
  const { mutate: deleteBeneficiary } = useDeleteBeneficiary();

  const handleDelete = (id) => {
    deleteBeneficiary(id, {
      onSuccess: () => {
        Toaster({
          title: "Beneficiary deleted",
          description: "The beneficiary has been removed from your account",
        });
      },
      onError: (error) => {
        Toaster({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <User className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No beneficiaries added yet</p>
        <Button onClick={() => navigate("/profile/beneficiaries/add")}>
          Add Beneficiary
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Relationship</TableHead>
          <TableHead>Date of Birth</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {beneficiaries.map((beneficiary) => (
          <TableRow key={beneficiary._id}>
            <TableCell className="font-medium">
              {beneficiary.firstName} {beneficiary.lastName}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {beneficiary.relationship}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(beneficiary.dob).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge variant={beneficiary.isVerified ? "default" : "secondary"}>
                {beneficiary.isVerified ? "Verified" : "Pending"}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate(`/profile/beneficiaries/${beneficiary._id}/edit`)
                }
              >
                <Pen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(beneficiary._id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
