import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Shield,
  Lock,
  Star,
  Zap,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { type SubscriptionPlan } from "@/store/appStore";

// ---------------------------------------------------------------------------
// STRIPE CONFIGURATION
// Replace these with your actual Stripe publishable key and Payment Link URLs
// from your Stripe Dashboard (https://dashboard.stripe.com)
// ---------------------------------------------------------------------------
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

// Stripe Payment Links — create these in your Stripe Dashboard under
// Products → Payment Links. Each link creates a hosted checkout page
// that accepts card, PayPal, and Venmo automatically.
const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  basic: import.meta.env.VITE_STRIPE_BASIC_PAYMENT_LINK as string ?? "",
  premium: import.meta.env.VITE_STRIPE_PREMIUM_PAYMENT_LINK as string ?? "",
};

// ---------------------------------------------------------------------------

interface PlanOption {
  id: SubscriptionPlan;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlight: boolean;
  badge?: string;
}

const PLANS: PlanOption[] = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    interval: "month",
    description: "Everything you need to get started with property matching.",
    features: [
      "Up to 5 matches per month",
      "Seller contact information",
      "Compatibility score breakdown",
      "Email match alerts",
      "Mobile-optimized dashboard",
    ],
    highlight: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 149,
    interval: "month",
    description: "Unlimited access with AI-powered insights and priority placement.",
    features: [
      "Unlimited matches",
      "Seller contact information",
      "Full AI score breakdown",
      "Real-time match alerts",
      "Priority match placement",
      "Deal probability insights",
      "Early access to new listings",
    ],
    highlight: true,
    badge: "Most Popular",
  },
];

interface PaymentMethodInfo {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex, Discover",
    icon: <CreditCard size={20} className="text-blue-600" />,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Pay with your PayPal balance or linked bank",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-700">
        <path
          d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.348 6.797-8.648 6.797h-2.19c-.524 0-.967.382-1.05.9l-1.12 7.106H3.83l-.24 1.516a.641.641 0 0 0 .633.74h4.358c.525 0 .968-.382 1.05-.9l.438-2.775.027-.13.684-4.331c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.648-6.796a5.505 5.505 0 0 0-.446-2.946z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "venmo",
    label: "Venmo",
    description: "Pay with your Venmo account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3D95CE" />
        <path
          d="M18.5 4.5c.5.8.7 1.7.7 2.8 0 3.5-3 8-5.4 11.2H8.7L6.5 4.5l5-.5 1.1 8.7c1-1.8 2.3-4.6 2.3-6.5 0-1-.2-1.8-.5-2.4L18.5 4.5z"
          fill="white"
        />
      </svg>
    ),
  },
];

interface Props {
  onSuccess?: (plan: SubscriptionPlan) => void;
  onCancel?: () => void;
  preselectedPlan?: SubscriptionPlan;
}

export function StripeCheckout({ onSuccess, onCancel, preselectedPlan }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(preselectedPlan ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  const isConfigured =
    !!STRIPE_PUBLISHABLE_KEY &&
    STRIPE_PUBLISHABLE_KEY !== "pk_test_YOUR_KEY_HERE" &&
    !!STRIPE_PAYMENT_LINKS.basic &&
    !!STRIPE_PAYMENT_LINKS.premium;

  const handleCheckout = async (plan: PlanOption) => {
    setSelectedPlan(plan.id);

    if (!isConfigured) {
      setShowSetupDialog(true);
      return;
    }

    const paymentLink = STRIPE_PAYMENT_LINKS[plan.id as string];
    if (!paymentLink) {
      setShowSetupDialog(true);
      return;
    }

    setIsLoading(true);

    try {
      // Open Stripe's hosted payment page in a new tab.
      // Stripe Payment Links handle card, PayPal, and Venmo automatically
      // based on what you've enabled in your Stripe Dashboard.
      // All payments go directly to your connected Stripe account.
      window.open(paymentLink, "_blank", "noopener,noreferrer");

      // Optimistically update subscription after user returns
      // In production you'd use a webhook or return URL to confirm payment
      setTimeout(() => {
        onSuccess?.(plan.id);
        setIsLoading(false);
      }, 2000);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Not-configured banner */}
      {!isConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Stripe not yet connected</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add your Stripe keys to <code className="font-mono bg-amber-100 px-1 rounded">.env</code> to enable live payments.{" "}
              <button
                type="button"
                className="underline font-medium"
                onClick={() => setShowSetupDialog(true)}
              >
                View setup guide
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Payment methods row */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Accepted payment methods
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className="flex flex-col items-center gap-1.5 p-3 bg-white border border-slate-200 rounded-xl text-center"
            >
              {method.icon}
              <span className="text-xs font-medium text-slate-700">{method.label}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{method.description}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Plan cards */}
      <div className="space-y-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? "border-blue-500 bg-blue-50"
                : plan.highlight
                  ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white text-xs px-3 py-0.5 shadow-sm">
                  <Star size={10} className="mr-1 fill-white" />
                  {plan.badge}
                </Badge>
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  ${plan.price}
                  <span className="text-sm font-normal text-slate-500">/{plan.interval}</span>
                </p>
                <p className="text-xs text-slate-400">billed monthly</p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${
                plan.highlight
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-800 hover:bg-slate-900 text-white"
              }`}
              disabled={isLoading && selectedPlan === plan.id}
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout(plan);
              }}
            >
              {isLoading && selectedPlan === plan.id ? (
                <span className="flex items-center gap-2">
                  <Zap size={14} className="animate-pulse" />
                  Redirecting to checkout...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock size={14} />
                  Subscribe — ${plan.price}/mo
                  <ExternalLink size={12} className="opacity-60" />
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Shield size={13} className="text-green-500" />
          256-bit SSL
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Lock size={13} className="text-blue-500" />
          Powered by Stripe
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircle size={13} className="text-green-500" />
          Cancel anytime
        </div>
      </div>

      {onCancel && (
        <Button variant="ghost" className="w-full text-slate-500" onClick={onCancel}>
          Maybe later
        </Button>
      )}

      {/* Setup guide dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Connect Your Stripe Account
            </DialogTitle>
            <DialogDescription>
              Follow these steps to enable payments that go directly to your Stripe account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-3">
              <Step number={1} title="Create Stripe products">
                In your{" "}
                <a
                  href="https://dashboard.stripe.com/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Stripe Dashboard → Products
                </a>
                , create two recurring products:
                <ul className="mt-1 ml-4 space-y-1 text-slate-600 list-disc">
                  <li>DealMatch Basic — $99/month</li>
                  <li>DealMatch Premium — $149/month</li>
                </ul>
              </Step>

              <Step number={2} title="Create Payment Links">
                For each product, go to{" "}
                <a
                  href="https://dashboard.stripe.com/payment-links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Payment Links
                </a>{" "}
                and enable <strong>Card</strong>, <strong>PayPal</strong>, and <strong>Venmo</strong> as payment methods.
              </Step>

              <Step number={3} title="Add environment variables">
                Create a <code className="bg-slate-100 px-1 rounded font-mono text-xs">.env</code> file in your project root:
                <div className="mt-2 bg-slate-900 text-green-400 text-xs font-mono p-3 rounded-lg leading-relaxed">
                  <p>VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx</p>
                  <p>VITE_STRIPE_BASIC_PAYMENT_LINK=https://buy.stripe.com/xxx</p>
                  <p>VITE_STRIPE_PREMIUM_PAYMENT_LINK=https://buy.stripe.com/yyy</p>
                </div>
              </Step>

              <Step number={4} title="Enable PayPal & Venmo">
                In Stripe Dashboard →{" "}
                <a
                  href="https://dashboard.stripe.com/settings/payment_methods"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Settings → Payment methods
                </a>
                , enable PayPal and Venmo. All payments route directly to your account.
              </Step>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <Shield size={13} className="inline mr-1" />
              Stripe handles PCI compliance, fraud detection, and secure payment processing. You never touch card data.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-semibold text-slate-800 mb-1">{title}</p>
        <div className="text-slate-600">{children}</div>
      </div>
    </div>
  );
}
