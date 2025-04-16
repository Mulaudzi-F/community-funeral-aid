import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { useUpdateNotificationSettings } from "@/hooks/useProfile";

export const AccountSettings = ({ user }) => {
  const { mutate: updateSettings, isLoading } = useUpdateNotificationSettings();

  const handleNotificationChange = (type, value) => {
    updateSettings(
      { [type]: value },
      {
        onSuccess: () => {
          Toaster({
            title: "Settings updated",
            description: "Your notification preferences have been updated",
          });
        },
        onError: (error) => {
          Toaster({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={user.notificationSettings?.email}
              onCheckedChange={(value) =>
                handleNotificationChange("email", value)
              }
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive urgent alerts via SMS
              </p>
            </div>
            <Switch
              checked={user.notificationSettings?.sms}
              onCheckedChange={(value) =>
                handleNotificationChange("sms", value)
              }
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Payment Reminders</p>
              <p className="text-sm text-muted-foreground">
                Receive reminders for upcoming contributions
              </p>
            </div>
            <Switch
              checked={user.notificationSettings?.paymentReminders}
              onCheckedChange={(value) =>
                handleNotificationChange("paymentReminders", value)
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full">
            Download Personal Data
          </Button>
          <Button variant="outline" className="w-full text-destructive">
            Request Account Deletion
          </Button>
        </div>
      </div>
    </div>
  );
};
