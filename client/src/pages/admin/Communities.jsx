import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useCommunities } from "@/hooks/useCommunities"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/communities/columns"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateCommunityDialog } from "@/components/communities/CreateCommunityDialog"
import { useAuth } from "@/contexts/AuthContext"

export const Communities = () => {
  const { data: communities, isLoading, isError } = useCommunities()
  const { user } = useAuth()

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
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
    )
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communities</h1>
        {user?.isAdmin && <CreateCommunityDialog />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={communities}
            searchKey="name"
          />
        </CardContent>
      </Card>
    </div>
  )
}