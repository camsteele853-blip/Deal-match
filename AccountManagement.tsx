import { useState } from "react";
import { useAppStore, type SubscriptionPlan } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  Crown,
  Bell,
  LogOut,
  ArrowLeft,
  Clock,
  Shield,
  CreditCard,
  User,
} from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";

interface Props {
  onBack: () => void;
}

export function AccountManagement({ onBack }: Props) {
  const {
    getCurrentUser,
    updateNotificationPreferences,
    updateSubscription,
    logout,
  } = useAppStore();

  const user = getCurrentUser();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!user) return null;

  const isSeller = user.role === "seller";
  const isActive = user.subscriptionStatus === "active";

  const trialDaysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(user.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const handlePaymentSuccess = (plan: SubscriptionPlan) => {
    if (!plan) return;
    updateSubscription(user.userId, plan, "active");
    // Don't close modal here — CheckoutModal will close itself after showing success animation
  };

  const handleCancelSubscription = () => {
    updateSubscription(user.userId, null, "expired");
  };

  const toggleNotifPref = (key: keyof typeof user.notificationPreferences) => {
    updateNotificationPreferences(user.userId, {
      ...user.notificationPreferences,
      [key]: !user.notificationPreferences[key],
    });
  };

  const statusColor =
    user.subscriptionStatus === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : user.subscriptionStatus === "trial"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="font-semibold text-slate-800">Account</h1>
            <p className="text-xs text-slate-400">Manage your profile & subscription</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                  <Badge variant="outline" className={`text-xs capitalize border ${statusColor}`}>
                    {user.subscriptionStatus === "trial" ? `Trial — ${trialDaysLeft}d left` : user.subscriptionStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section — buyers only */}
        {!isSeller && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown size={16} className="text-amber-500" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isActive ? (
                /* Active subscription state */
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-semibold text-green-700 text-sm capitalize">
                      {user.subscriptionPlan} Plan — Active
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    You have full access to all matches and features.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-3 text-red-500 border-red-200 hover:bg-red-50">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will lose access to all matches and contact information immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleCancelSubscription}
                        >
                          Cancel Anyway
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                /* Not subscribed — prompt to subscribe */
                <>
                  {user.subscriptionStatus === "trial" && (
                    <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                      <Clock size={14} className="text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-700">
                        <span className="font-semibold">{trialDaysLeft} days</span> remaining in your free trial
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    <CreditCard size={15} className="mr-2" />
                    Choose a Plan &amp; Subscribe
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    <Shield size={12} className="inline mr-1" />
                    Secure checkout via Stripe · Card, PayPal, Venmo accepted · Cancel anytime
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seller free access notice */}
        {isSeller && (
          <Card className="shadow-sm border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-sm">Free Seller Account</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Seller accounts are always free on DealMatch. You have unlimited access to all buyer matches and contact information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Preferences */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={16} className="text-slate-500" />
              Notifications
            </CardTitle>
            <CardDescription>Choose how you receive match alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-sm">Email Notifications</Label>
                <p className="text-xs text-slate-500">Receive match summaries by email</p>
              </div>
              <Switch
                checked={user.notificationPreferences.email}
                onCheckedChange={() => toggleNotifPref("email")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-sm">In-App Notifications</Label>
                <p className="text-xs text-slate-500">Show alerts in your dashboard</p>
              </div>
              <Switch
                checked={user.notificationPreferences.inApp}
                onCheckedChange={() => toggleNotifPref("inApp")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-sm">Match Alerts</Label>
                <p className="text-xs text-slate-500">Instant alerts for new high-probability matches</p>
              </div>
              <Switch
                checked={user.notificationPreferences.matchAlerts}
                onCheckedChange={() => toggleNotifPref("matchAlerts")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="shadow-sm">
          <CardContent className="py-4 space-y-2 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Member since</span>
              <span className="text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Trial ends</span>
              <span className="text-slate-700">{new Date(user.trialEndDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Account ID</span>
              <span className="font-mono text-xs text-slate-400">{user.userId.slice(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-red-500 border-red-200 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
