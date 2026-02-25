import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  CheckCircle,
  CreditCard,
  Shield,
  Star,
  Lock,
  ArrowLeft,
  Gift,
} from "lucide-react";
import { type SubscriptionPlan } from "@/store/appStore";

interface PlanOption {
  id: SubscriptionPlan;
  name: string;
  price: number;
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

type PaymentMethodId = "card" | "paypal" | "venmo";

interface PaymentMethodInfo {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: <CreditCard size={20} className="text-blue-600" />,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Pay with PayPal balance",
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
    description: "Pay with Venmo account",
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

type Step = "plan" | "payment" | "confirm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (plan: SubscriptionPlan) => void;
  preselectedPlan?: SubscriptionPlan;
}

export function CheckoutModal({ open, onOpenChange, onSuccess, preselectedPlan }: Props) {
  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(preselectedPlan ?? null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const chosenPlan = PLANS.find((p) => p.id === selectedPlan);

  const handleClose = (open: boolean) => {
    if (!open) {
      // reset state when closing
      setStep("plan");
      setSelectedPlan(preselectedPlan ?? null);
      setSelectedPayment(null);
      setIsProcessing(false);
      setIsDone(false);
    }
    onOpenChange(open);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan || !selectedPayment) return;
    setIsProcessing(true);
    // Simulate payment processing with a brief delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      // Call onSuccess immediately so the subscription updates
      onSuccess(selectedPlan);
      // Give the success animation a moment to show before closing
      setTimeout(() => {
        handleClose(false);
      }, 1800);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full max-h-[90dvh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            {step !== "plan" && !isDone && (
              <button
                type="button"
                onClick={() => setStep(step === "payment" ? "plan" : "payment")}
                className="mr-1 text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <CreditCard size={18} className="text-blue-600" />
            {isDone ? "Subscribed!" : step === "plan" ? "Choose Your Plan" : step === "payment" ? "Payment Method" : "Confirm & Subscribe"}
          </DialogTitle>
          <DialogDescription>
            {isDone
              ? "Your subscription is now active."
              : step === "plan"
              ? "Select a plan — 3-day free trial included, cancel anytime."
              : step === "payment"
              ? "How would you like to pay?"
              : `Confirm your ${chosenPlan?.name} plan subscription.`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Success state */}
          {isDone && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">Welcome to DealMatch {chosenPlan?.name}!</p>
                <p className="text-sm text-slate-500 mt-1">You now have full access to all features.</p>
              </div>
            </div>
          )}

          {/* Step 1: Plan selection */}
          {!isDone && step === "plan" && (
            <>
              {/* 3-day trial banner */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Gift size={16} className="text-green-600 shrink-0" />
                <p className="text-sm text-green-700">
                  <span className="font-semibold">3-day free trial</span> — no charge until trial ends. Cancel anytime.
                </p>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-blue-500 bg-blue-50"
                        : plan.highlight
                        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-blue-600 text-white text-xs px-2.5 py-0.5 shadow-sm">
                          <Star size={9} className="mr-1 fill-white" />
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xl font-bold text-slate-900">
                          ${plan.price}
                          <span className="text-xs font-normal text-slate-500">/mo</span>
                        </p>
                        <p className="text-[10px] text-slate-400">after free trial</p>
                      </div>
                    </div>

                    <ul className="space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle size={11} className="text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Selection indicator */}
                    {selectedPlan === plan.id && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <CheckCircle size={12} className="text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                disabled={!selectedPlan}
                onClick={() => setStep("payment")}
              >
                Continue
              </Button>
            </>
          )}

          {/* Step 2: Payment method */}
          {!isDone && step === "payment" && (
            <>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{method.label}</p>
                      <p className="text-xs text-slate-400">{method.description}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <CheckCircle size={18} className="text-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                disabled={!selectedPayment}
                onClick={() => setStep("confirm")}
              >
                Continue
              </Button>
            </>
          )}

          {/* Step 3: Confirm */}
          {!isDone && step === "confirm" && chosenPlan && (
            <>
              {/* Order summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Order Summary</p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">DealMatch {chosenPlan.name}</span>
                  <span className="font-bold text-slate-800">${chosenPlan.price}/mo</span>
                </div>

                <div className="flex justify-between items-center text-green-700">
                  <span className="text-sm font-medium">3-Day Free Trial</span>
                  <span className="font-semibold">-${chosenPlan.price}.00</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Due today</span>
                  <span className="text-xl font-bold text-green-600">$0.00</span>
                </div>

                <p className="text-xs text-slate-400">
                  After your 3-day trial, you'll be billed ${chosenPlan.price}/month. Cancel anytime before then.
                </p>
              </div>

              {/* Payment method summary */}
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                  {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.label}
                  </p>
                  <p className="text-xs text-slate-400">Selected payment method</p>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock size={16} />
                    Start Free Trial — $0 Today
                  </span>
                )}
              </Button>

              {/* Trust row */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Shield size={12} className="text-green-500" />
                  Secure & Encrypted
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <CheckCircle size={12} className="text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
