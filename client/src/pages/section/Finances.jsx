import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSectionFinances } from "@/hooks/useSections";

export function SectionFinances({ sectionId }) {
  const { data, isLoading, isError } = useSectionFinances(sectionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finances</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load financial data</p>
        </CardContent>
      </Card>
    );
  }

  const finances = data.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Finances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium">Current Balance</h3>
            <p className="text-2xl font-bold">
              ZAR {finances.currentBalance.toFixed(2)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium">Estimated Funeral Contribution</h3>
            <p className="text-2xl font-bold">
              ZAR {finances.expectedFuneralContribution.toFixed(2) * 0.75}
            </p>
            <p className="text-sm text-muted-foreground">
              {finances.memberStats.active} active members × ZAR{" "}
              {finances.contributionAmount}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium">Members Status</h3>
            <div className="flex gap-4 mt-2">
              <div>
                <Badge variant="default">
                  {finances.memberStats.active} Active
                </Badge>
              </div>
              <div>
                <Badge variant="secondary">
                  {finances.memberStats.suspended} Suspended
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Recent Payouts</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances.recentPayouts.map((payout) => (
                <TableRow key={payout._id}>
                  <TableCell>
                    {format(new Date(payout.payoutDate), "PP")}
                  </TableCell>
                  <TableCell>ZAR {payout.payoutAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {finances.recentPayouts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No recent payouts
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
