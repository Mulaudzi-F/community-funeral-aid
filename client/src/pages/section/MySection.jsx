import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSection } from "@/hooks/useSections";
import { SectionMembers } from "./Members";
import { SectionReports } from "./SectionReports";
import { SectionFinances } from "./Finances";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const MySection = () => {
  const { data: section, isLoading, isError } = useSection();

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
        <h1 className="text-3xl font-bold">{section.name}</h1>
        <div className="text-sm text-muted-foreground">
          Part of {section.community.name}
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <SectionMembers members={section.members} />
        </TabsContent>

        <TabsContent value="reports">
          <SectionReports reports={section.recentReports} />
        </TabsContent>

        <TabsContent value="finances">
          <SectionFinances finances={section.finances} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
