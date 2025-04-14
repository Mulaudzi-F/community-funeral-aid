import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminActivity } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const activityIcons = {
  payment: <DollarSign className="h-4 w-4" />,
  registration: <Users className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
  approval: <CheckCircle2 className="h-4 w-4" />,
  rejection: <AlertCircle className="h-4 w-4" />,
};

export const ActivityFeed = () => {
  const { data: activities, isLoading, isError } = useAdminActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-destructive">
          Failed to load activity feed
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            {activities?.map((activity) => (
              <div key={activity._id} className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  {activity.metadata && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          <span className="font-medium">{key}:</span> {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
