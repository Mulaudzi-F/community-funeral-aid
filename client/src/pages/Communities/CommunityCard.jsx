import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CommunityCard = ({ community }) => {
  return (
    <Link to={`/communities/${community._id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <span>{community.name}</span>
            <Badge variant="secondary">{community.membersCount} members</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2">
            {community.description || "No description provided"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
