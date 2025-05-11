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
import { Pen, Trash2, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditBeneficiaryDialog } from "./EditBeneficiaryDialog";

export const BeneficiariesTable = ({ beneficiaries }) => {
  const navigate = useNavigate();

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate("/profile/beneficiaries/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficiary
        </Button>
      </div>
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
                <Badge variant={beneficiary.isAlive ? "default" : "secondary"}>
                  {beneficiary.isAlive ? "Active" : "deceased"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end space-x-2">
                {!beneficiary.isPrimary && (
                  <EditBeneficiaryDialog beneficiary={beneficiary} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
