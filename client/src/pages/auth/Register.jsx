import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { useCommunitySection } from "@/hooks/useSections";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logActivity } from "@/utils/activity";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCommunityForm } from "../Communities/CreateCommunityForm";
import { Label } from "@/components/ui/label";
import { CreateSectionForm } from "../section/CreateSectionForm";
import { toast } from "sonner";
import { PaymentDialog } from "./PaymentDialogue";

// Form validation schema
const formSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    idNumber: z.string().min(13).max(13, "ID number must be 13 characters"),
    dob: z.string().nonempty("Date of birth is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    address: z.object({
      street: z.string().min(2, "Street address is required"),
      city: z.string().min(2, "City is required"),
      province: z.string().min(2, "Province is required"),
      postalCode: z.string().min(4, "Postal code is required"),
      country: z.string().default("South Africa"),
    }),
    communityId: z.string().min(1, "Please select a community"),
    sectionId: z.string().min(1, "Please select a section"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const Register = () => {
  const navigate = useNavigate();
  const { register, isRegistering, registrationInProgress } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionSearchTerm, setSectionSearchTerm] = useState("");
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      idNumber: "",
      dob: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: {
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "South Africa",
      },
      addressProof: "",
      communityId: "",
      sectionId: "",
    },
  });

  const selectedCommunityId = form.watch("communityId");
  const {
    data: communities,
    isLoading: isLoadingCommunities,
    refetchCommunities,
  } = useCommunities(searchTerm);
  // Fetch sections only when a community is selected
  const {
    data: sections,
    isLoading: isLoadingSections,
    refetchSections,
  } = useCommunitySection(selectedCommunityId, {
    enabled: !!selectedCommunityId, // Only fetch if communityId exists
  });

  // Filter sections based on search term
  const filteredSections = sections?.data.filter((section) =>
    section.name.toLowerCase().includes(sectionSearchTerm.toLowerCase())
  );

  console.log(paymentDialogOpen);

  const onSubmit = async (values) => {
    try {
      // Register the user
      const response = await register(values);

      // Set payment data first
      setPaymentData({
        paymentUrl: response.paymentUrl,
        reference: response.paymentReference,
        amount: 40,
        description: "Account activation fee",
      });

      // Then open the payment dialog
      setPaymentDialogOpen(true);

      // Prevent form submission from causing a page reload
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      form.setError("root", {
        type: "manual",
        message: error.message || "Registration failed",
      });
    }
  };
  if (registrationInProgress) {
    return <div>Completing registration...</div>;
  }

  const handlePaymentComplete = () => {
    toast("Payment successful", {
      description: "Your account will be activated shortly.",
    });
    setPaymentDialogOpen(false);
    // Navigate to verify email after payment is complete
    navigate("/verify-email");
  };

  // Handle community creation success
  const handleCommunityCreated = (newCommunity) => {
    form.setValue("communityId", newCommunity._id);
    setShowCreateCommunity(false);
    refetchCommunities();
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID Number */}
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>South African ID Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
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

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0821234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Community Selection */}
                <div className="col-span-full w-full space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Community Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="communityId"
                      render={({ field }) => {
                        const filteredCommunities =
                          communities?.data?.filter((community) =>
                            community.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          ) || [];

                        return (
                          <FormItem>
                            <FormLabel>Community</FormLabel>

                            {/* Search Input */}
                            <div className="relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search communities..."
                                className="pl-8 mb-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>

                            {/* Community Select */}
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("sectionId", ""); // Reset section when community changes
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a community" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingCommunities ? (
                                  <div className="p-4 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                  </div>
                                ) : filteredCommunities.length > 0 ? (
                                  <>
                                    {filteredCommunities.map((community) => (
                                      <SelectItem
                                        key={community._id}
                                        value={community._id}
                                      >
                                        {community.name}
                                      </SelectItem>
                                    ))}

                                    {/* Special extra item (can be styled to look different or disabled if needed) */}
                                    <div className="p-2">
                                      <Dialog
                                        open={showCreateCommunity}
                                        onOpenChange={setShowCreateCommunity}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start gap-2"
                                            type="button"
                                          >
                                            <PlusCircle className="h-4 w-4" />
                                            Create New Community
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Create New Community
                                            </DialogTitle>
                                          </DialogHeader>
                                          <CreateCommunityForm
                                            onSuccess={handleCommunityCreated}
                                          />
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </>
                                ) : (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    No communities found.
                                    <div className="mt-2">
                                      <Dialog
                                        open={showCreateCommunity}
                                        onOpenChange={setShowCreateCommunity}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            type="button"
                                          >
                                            <PlusCircle className="h-4 w-4" />
                                            Create New Community
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Create New Community
                                            </DialogTitle>
                                          </DialogHeader>
                                          <CreateCommunityForm
                                            onSuccess={handleCommunityCreated}
                                          />
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                )}
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="sectionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section</FormLabel>
                          {selectedCommunityId ? (
                            <div className="space-y-2">
                              <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search sections..."
                                  className="pl-8"
                                  value={sectionSearchTerm}
                                  onChange={(e) =>
                                    setSectionSearchTerm(e.target.value)
                                  }
                                />
                              </div>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a section" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingSections ? (
                                    <div className="flex justify-center py-4">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                  ) : filteredSections?.length > 0 ? (
                                    <>
                                      {filteredSections.map((section) => (
                                        <SelectItem
                                          key={section._id}
                                          value={section._id}
                                        >
                                          {section.name}
                                        </SelectItem>
                                      ))}

                                      <div className="p-2">
                                        <Dialog
                                          open={isSectionDialogOpen}
                                          onOpenChange={setIsSectionDialogOpen}
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              type="button"
                                              variant="link"
                                              className="text-sm text-primary w-full justify-start"
                                            >
                                              <PlusCircle className="mr-2 h-4 w-4" />
                                              Create new section
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>
                                                Create New Section
                                              </DialogTitle>
                                            </DialogHeader>
                                            <CreateSectionForm
                                              communityId={selectedCommunityId}
                                            />
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                      No sections found
                                      <div className="mt-2">
                                        <Dialog
                                          open={isSectionDialogOpen}
                                          onOpenChange={setIsSectionDialogOpen}
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              type="button"
                                              variant="link"
                                              className="text-sm text-primary"
                                            >
                                              <PlusCircle className="mr-2 h-4 w-4" />
                                              Create new section
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>
                                                Create New Section
                                              </DialogTitle>
                                            </DialogHeader>
                                            <CreateSectionForm
                                              communityId={selectedCommunityId}
                                            />
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
                              Please select a community first
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Johannesburg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Gauteng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Must be at least 8 characters with uppercase, lowercase,
                        number, and special character
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button asChild variant="ghost">
                  <Link to="/login">Already have an account? Login</Link>
                </Button>

                <Button type="submit" disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register (R50 Activation Fee)"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <PaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            paymentData={paymentData}
            onComplete={handlePaymentComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
};
