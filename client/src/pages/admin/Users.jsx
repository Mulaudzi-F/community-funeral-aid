import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAdminUsers } from "@/hooks/useAdmin";
import { DataTable } from "@/components/ui/table";
import { columns } from "@/components/admin/user-columns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const AdminUsers = () => {
  const [statusFilter, setStatusFilter] = useState("active");
  const { data: users, isLoading, isError } = useAdminUsers(statusFilter);

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
            <p className="text-destructive">Failed to load users</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-4">
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "active" && "Active Users"}
            {statusFilter === "pending" && "Pending Activation"}
            {statusFilter === "suspended" && "Suspended Users"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
};
