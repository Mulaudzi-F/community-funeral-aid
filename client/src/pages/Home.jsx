import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeartHandshake, Users, ShieldCheck, HandCoins } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Community Funeral Aid
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Supporting each other in times of need through collective
          contributions
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link to="/register">Join a Community</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <HeartHandshake className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Mutual Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Community members support each other during difficult times
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Section-Based</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Organized into sections for more manageable support groups
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Verified System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Death reports are verified by multiple members and admins
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <HandCoins className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Transparent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All contributions and payouts are tracked and visible
            </p>
          </CardContent>
        </Card>
      </section>

      {!user && (
        <section className="text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Ready to join?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Become part of a supportive community that helps each other in
                times of need
              </p>
              <Button size="lg" asChild>
                <Link to="/register">Register Now</Link>
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" asChild className="px-0">
                  <Link to="/login">Login here</Link>
                </Button>
              </p>
            </CardFooter>
          </Card>
        </section>
      )}
    </div>
  );
};
