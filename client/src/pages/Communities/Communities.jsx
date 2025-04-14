import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import { DataTable } from "@/features/Data-Table";
import { columns } from "./Columns";
import { Skeleton } from "@/components/ui/skeleton";

export const Communities = () => {
  const { data: communities, isLoading, isError } = useCommunities();

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
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
            <p className="text-destructive">Failed to load communities</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communities</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Join Community
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={communities} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
};
