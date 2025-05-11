import { DeathReportReview } from "./DeathReportReview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const columns = [
  {
    id: "deceased.firstName",
    Header: "First Name",
    accessor: (row) => row.deceased?.firstName, // Access nested field
  },
  {
    id: "deceased.lastName",
    Header: "Last Name",
    accessor: (row) => row.deceased?.lastName, // Access nested field
  },
  {
    id: "status",
    Header: "Status",
    accessor: "status",
  },
  {
    accessorKey: "deceased.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deceased
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.deceased.firstName} {row.original.deceased.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "reporter.name",
    header: "Reporter",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.reporter.firstName} {row.original.reporter.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "votes",
    header: "Votes",
    cell: ({ row }) => {
      const votes = row.getValue("votes");
      const approvals = votes.filter((v) => v.approved).length;
      return `${approvals}/${votes.length} approvals`;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Reported",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    cell: ({ row }) => {
      const deadline = new Date(row.getValue("deadline"));
      const now = new Date();
      const hoursLeft = Math.floor((deadline - now) / (1000 * 60 * 60));

      return (
        <div className="flex items-center gap-2">
          <span>{deadline.toLocaleDateString()}</span>
          <Badge variant={hoursLeft < 24 ? "destructive" : "secondary"}>
            {hoursLeft > 0 ? `${hoursLeft}h left` : "Expired"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original;

      return (
        <div className="flex gap-2">
          <DeathReportReview report={report} />
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
