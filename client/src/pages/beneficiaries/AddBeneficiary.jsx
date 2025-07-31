import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddBeneficiary, useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { BeneficiaryLimitModal } from "./BeneficiaryLimit";

const MAX_BENEFICIARIES = 7;
const beneficiarySchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  idNumber: z.string().min(13, "Must be a valid South African ID number"),
  dob: z.string().min(1, "Required"),
  relationship: z.enum(["child", "spouse"]),
});

export const AddBeneficiary = () => {
  const navigate = useNavigate();
  const { mutate: addBeneficiary, isPending } = useAddBeneficiary();
  const { data: beneficiaries } = useBeneficiaries();

  const form = useForm({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      idNumber: "",
      dob: "",
      relationship: "child",
    },
  });
  const checkBeneficiaryAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const onSubmit = (values) => {
    const age = checkBeneficiaryAge(values.dob);
    if (age > 25) {
      form.setError("dob", {
        type: "manual",
        message: "Beneficiary must be under 23 years old at time of addition",
      });
      return;
    }

    addBeneficiary(values, {
      onSuccess: () => {
        navigate("/profile/");
      },
    });
  };

  return (
    <div className="container py-8">
      <BeneficiaryLimitModal />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Beneficiary</h1>
          <p className="text-muted-foreground">
            Current beneficiaries:{" "}
            {beneficiaries && beneficiaries.filter((b) => b.isAlive).length}/
            {MAX_BENEFICIARIES}
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Beneficiary</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>South African ID Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end px-0 pb-0 pt-6 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/profile/beneficiaries")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Beneficiary
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
