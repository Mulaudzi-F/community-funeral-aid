import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateDeathReport } from "@/hooks/useDeathReports";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/useAuth";
import { logActivity } from "@/utils/activity";

const formSchema = z.object({
  beneficiaryId: z.string().min(1, "Required"),
  deathCertificate: z
    .any()
    .refine(
      (file) => file instanceof File,
      "Please upload a death certificate"
    ),
  bankDetails: z.object({
    accountHolder: z.string().min(1, "Required"),
    accountNumber: z.string().min(1, "Required"),
    bankName: z.string().min(1, "Required"),
    branchCode: z.string().min(1, "Required"),
    accountType: z.enum(["savings", "cheque", "transmission"]),
  }),
});

export const ReportDeath = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: beneficiaries } = useBeneficiaries();
  const { mutateAsync: createDeathReport, isPending } = useCreateDeathReport();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaryId: "",
      deathCertificate: undefined,
      bankDetails: {
        accountHolder: "",
        accountNumber: "",
        bankName: "",
        branchCode: "",
        accountType: "savings",
      },
    },
  });

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append("beneficiaryId", values.beneficiaryId);
    formData.append("deathCertificate", values.deathCertificate);
    formData.append("bankDetails", JSON.stringify(values.bankDetails));

    try {
      const response = await createDeathReport(formData);

      // When a report is submitted
      const beneficiary = beneficiaries.find(
        (b) => b._id === values.beneficiaryId
      );

      const deceasedName = beneficiary
        ? `${beneficiary.firstName} ${beneficiary.lastName}`
        : "Unknown";

      await logActivity(
        user._id,
        "report_submitted",
        "Death report submitted",
        `Your report for ${deceasedName} has been submitted for review`,
        { reportId: response.reporter }
      );

      navigate("/death-reports");
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Report a Death</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="beneficiaryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a beneficiary" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {beneficiaries?.map((beneficiary) => (
                          <SelectItem
                            key={beneficiary._id}
                            value={beneficiary._id}
                          >
                            {beneficiary.firstName} {beneficiary.lastName} (
                            {beneficiary.relationship})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the deceased beneficiary from your list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deathCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Death Certificate</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a clear copy of the death certificate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bank Details for Payout</h3>

                <FormField
                  control={form.control}
                  name="bankDetails.accountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Standard Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.branchCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Code</FormLabel>
                      <FormControl>
                        <Input placeholder="051001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="transmission">
                            Transmission
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/death-reports")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
