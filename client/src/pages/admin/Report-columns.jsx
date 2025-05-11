import { DeathReportReview } from "./DeathReportReview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const columns = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const variants = {
        pending: { label: "Pending", variant: "secondary" },
        "under-review": { label: "Under Review", variant: "warning" },
        approved: { label: "Approved", variant: "success" },
        paid: { label: "Paid", variant: "default" },
        rejected: { label: "Rejected", variant: "destructive" },
      };

      return (
        <Badge variant={variants[status].variant}>
          {variants[status].label}
        </Badge>
      );
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
    accessorKey: "votes",
    header: "Votes",
    cell: ({ row }) => {
      const votes = row.getValue("votes");
      const approvals = votes.filter((v) => v.approved).length;
      return `${approvals}/${votes.length}`;
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
