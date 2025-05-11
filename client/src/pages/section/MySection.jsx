import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  useSection,
  useSectionFinances,
  useSectionReports,
} from "@/hooks/useSections";
import { SectionMembers } from "./Members";
import { SectionReports } from "./SectionReports";
import { SectionFinances } from "./Finances";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/useAuth";
import { PaymentHistory } from "../payments/PaymentHistory";

export const MySection = () => {
  const { user } = useAuth();
  const {
    section: { _id: sectionId },
  } = user;

  const { data: section, isLoading, isError } = useSection(sectionId);
  const { data: sectionReports, isLoading: sectionReportisLoading } =
    useSectionReports(sectionId);

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Failed to load section information
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{section.data?.name}</h1>
        <div className="text-sm text-muted-foreground">
          Part of {section.data?.community.name}
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="paymentHistory">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <SectionMembers members={section.data?.members} />
        </TabsContent>

        <TabsContent value="reports">
          <SectionReports reports={sectionReports?.data} />
        </TabsContent>

        <TabsContent value="finances">
          <SectionFinances sectionId={sectionId} />
        </TabsContent>

        <TabsContent>
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};
