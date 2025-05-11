// src/components/communities/CommunityDetail.js
import { useParams } from "react-router-dom";
import { useCommunity } from "@/hooks/useCommunities";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionList } from "./SectionList";
import { CommunityStats } from "./CommunityStats";
import { Skeleton } from "@/components/ui/skeleton";

export const CommunityDetail = () => {
  const { id } = useParams();
  const { data: community, isLoading, isError } = useCommunity(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive">Failed to load community</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{community.name}</h1>
        <Button>Manage Community</Button>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <SectionList communityId={id} />
        </TabsContent>
        <TabsContent value="stats">
          <CommunityStats communityId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
