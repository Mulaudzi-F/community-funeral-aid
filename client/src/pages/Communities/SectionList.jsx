// src/components/communities/SectionList.js
import { useCommunitySections } from "@/hooks/useCommunities";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Banknote, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSectionDialog } from "../section/CreateSectionDialogue";

export const SectionList = ({ communityId }) => {
  const {
    data: sections,
    isLoading,
    isError,
  } = useCommunitySections(communityId);
  console.log(sections);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive">Failed to load sections</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateSectionDialog communityId={communityId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.data?.map((section) => (
          <Card key={section._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{section.name}</CardTitle>
              <CardDescription>
                Created: {new Date(section.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4">
                <Users className="h-6 w-6" />
                <div>
                  <p className="text-sm font-medium">Members</p>
                  <p className="text-2xl">{section.members}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Banknote className="h-6 w-6" />
                <div>
                  <p className="text-sm font-medium">Balance</p>
                  <p className="text-2xl">
                    ZAR {section.currentBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link
                  to={`/communities/${communityId}/sections/${section._id}`}
                >
                  View Details <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
