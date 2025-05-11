// src/components/communities/CommunitySettings.js
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUpdateCommunity } from "@/hooks/useCommunities";

const formSchema = z.object({
  name: z.string().min(3, "Community name must be at least 3 characters"),
  description: z.string().optional(),
  contributionAmount: z.coerce.number().min(5, "Minimum contribution is ZAR 5"),
  adminFeePercentage: z.coerce
    .number()
    .min(0)
    .max(30, "Admin fee must be between 0-30%"),
});

export const CommunitySettings = ({ community }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: community.name,
      description: community.description || "",
      contributionAmount: community.contributionAmount,
      adminFeePercentage: community.adminFeePercentage,
    },
  });

  // ✅ Use the custom mutation hook
  const { mutate, isLoading, isError } = useUpdateCommunity();

  const onSubmit = (values) => {
    mutate(
      { id: community._id, data: values },
      {
        onSuccess: () => {
          toast({ title: "Community updated successfully" });
        },
        onError: (error) => {
          toast({
            title: "Error updating community",
            description: error?.response?.data?.message || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Community Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contributionAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Amount (ZAR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminFeePercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Fee Percentage</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
