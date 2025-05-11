import { useActivities } from "@/hooks/useActivities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Activity,
  CreditCard,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const activityIcons = {
  payment: <CreditCard className="h-4 w-4" />,
  new_member: <UserCheck className="h-4 w-4" />,
  report_submitted: <Activity className="h-4 w-4" />,
  report_approved: <CheckCircle2 className="h-4 w-4" />,
  alert: <AlertCircle className="h-4 w-4" />,
};

export const RecentActivity = () => {
  const { data, isLoading, isError } = useActivities();

  if (isLoading) {
    return <RecentActivitySkeleton />;
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Failed to load activities
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data?.data?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          data?.data?.map((activity) => (
            <div key={activity._id} className="flex items-start gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1">
                <div className="font-medium">{activity.title}</div>
                <div className="text-sm text-muted-foreground">
                  {activity.description}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(activity.createdAt), "PPpp")}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export const RecentActivitySkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
