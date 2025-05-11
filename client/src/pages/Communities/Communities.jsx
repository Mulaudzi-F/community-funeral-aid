// src/pages/CommunitiesPage.js
import { useCommunities } from "@/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityCard } from "./CommunityCard";
import { CreateCommunityDialog } from "./CreateCommunityDialog";

export const Communities = () => {
  const { data: communities, isLoading, isError } = useCommunities();

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Community Funeral Aid Network
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Join or create a community to support members during difficult times
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Available Communities</h2>
        <CreateCommunityDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load communities</p>
          <Button variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.data?.map((community) => (
            <CommunityCard key={community._id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
};
