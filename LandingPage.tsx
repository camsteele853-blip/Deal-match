import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore, type UserRole } from "@/store/appStore";
import {
  Home,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  Shield,
} from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

interface Props {
  onRegistered: (role: UserRole) => void;
  onLoggedIn: (role: UserRole) => void;
}

export function LandingPage({ onRegistered, onLoggedIn }: Props) {
  const [mode, setMode] = useState<"home" | "register" | "login">("home");
  const [selectedRole, setSelectedRole] = useState<UserRole>("investor");
  const [loginError, setLoginError] = useState("");
  const { registerUser, loginUser } = useAppStore();

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const handleRegister = (data: RegisterData) => {
    registerUser({ role: selectedRole, email: data.email, name: data.name });
    onRegistered(selectedRole);
  };

  const handleLogin = (data: LoginData) => {
    const userId = loginUser(data.email);
    if (userId) {
      const { users } = useAppStore.getState();
      const user = users.find((u) => u.userId === userId);
      if (user) onLoggedIn(user.role);
    } else {
      setLoginError("No account found with that email address.");
    }
  };

  if (mode === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-4 py-2 rounded-full text-sm mb-4">
              <Zap size={14} className="text-amber-400" />
              Start free — 10 day trial included
            </div>
            <h2 className="text-2xl font-bold text-white">Create your account</h2>
            <p className="text-slate-300 text-sm mt-1">Join hundreds of property professionals</p>
          </div>

          <Card className="shadow-2xl">
            <CardContent className="pt-5 space-y-4">
              {/* Role Selection */}
              <div>
                <Label className="font-semibold mb-2 block">I am a...</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["seller", "investor"] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        selectedRole === role
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {role === "seller" && <Home size={16} className="mx-auto mb-1" />}
                      {role === "investor" && <TrendingUp size={16} className="mx-auto mb-1" />}
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="John Smith" className="mt-1" {...registerForm.register("name")} />
                  {registerForm.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="john@example.com" className="mt-1" {...registerForm.register("email")} />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Account — Start Free Trial
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </form>

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <Shield size={12} />
                <span>10-day free trial · No credit card required</span>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => setMode("home")}
            className="block text-center text-slate-400 text-sm mt-4 hover:text-slate-200 w-full"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-300 text-sm mt-1">Sign in to see your matches</p>
          </div>

          <Card className="shadow-2xl">
            <CardContent className="pt-5">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="mt-1"
                    {...loginForm.register("email")}
                    onChange={() => setLoginError("")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                  {loginError && (
                    <p className="text-red-500 text-xs mt-1">{loginError}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign In
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </form>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Don't have an account? Sign up free
                </button>
              </div>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => setMode("home")}
            className="block text-center text-slate-400 text-sm mt-4 hover:text-slate-200 w-full"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // Home / Marketing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero */}
      <div className="px-4 pt-12 pb-8 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
          <Zap size={12} className="fill-amber-300" />
          AI-Powered Property Matching
        </div>

        <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
          Find Your Perfect
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Property Match
          </span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed mb-8">
          DealMatch connects <strong className="text-white">motivated sellers</strong> with{" "}
          <strong className="text-white">serious investors</strong> using AI compatibility scoring — so every connection counts.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-400 text-white h-12 text-base font-semibold"
            onClick={() => setMode("register")}
          >
            Get Started Free
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <button
            type="button"
            className="w-full border border-white/40 bg-white/10 text-white hover:bg-white/20 h-12 text-base font-semibold rounded-md transition-colors"
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
        </div>

        <p className="text-slate-400 text-xs mt-3">
          Free 10-day trial · Sellers always free · No credit card needed
        </p>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-8 max-w-lg mx-auto space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Zap size={20} className="text-amber-400" />, label: "AI Scoring", desc: "Real-time compatibility" },
            { icon: <CheckCircle size={20} className="text-green-400" />, label: "Qualified Leads", desc: "No tire kickers" },
            { icon: <Shield size={20} className="text-blue-400" />, label: "Trusted Network", desc: "Verified profiles" },
          ].map((f) => (
            <Card key={f.label} className="bg-white/10 backdrop-blur border-white/10 shadow-none">
              <CardContent className="py-4 text-center">
                <div className="mb-2 flex justify-center">{f.icon}</div>
                <p className="text-white text-xs font-semibold">{f.label}</p>
                <p className="text-slate-400 text-xs">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="bg-white/5 backdrop-blur border-white/10 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">How DealMatch works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                step: "1",
                title: "Create your profile",
                desc: "Sellers list their property details. Investors set their preferences and budget.",
                color: "bg-blue-500",
              },
              {
                step: "2",
                title: "AI analyzes compatibility",
                desc: "Our scoring engine evaluates motivation, urgency, financial fit, and closing probability.",
                color: "bg-purple-500",
              },
              {
                step: "3",
                title: "Get matched instantly",
                desc: "See your top 3-5 matches with detailed compatibility breakdowns.",
                color: "bg-emerald-500",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center shrink-0 text-white text-xs font-bold`}>
                  {item.step}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing Preview */}
        <Card className="bg-white/5 backdrop-blur border-white/10 shadow-none">
          <CardContent className="py-4">
            <p className="text-slate-300 text-xs text-center mb-3 uppercase tracking-wide font-semibold">Pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/10 rounded-lg text-center">
                <p className="text-white font-bold">Free</p>
                <p className="text-emerald-400 text-xs mt-1">Sellers always free</p>
                <ul className="mt-2 space-y-1 text-left">
                  {["Full match access", "Buyer contact info", "Match alerts"].map((f) => (
                    <li key={f} className="flex items-center gap-1 text-slate-300 text-xs">
                      <CheckCircle size={10} className="text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-600/30 border border-blue-500/40 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-white font-bold">$99–$149</p>
                  <Badge className="bg-blue-500 text-white text-xs px-1.5">Investors</Badge>
                </div>
                <p className="text-blue-300 text-xs mt-1">per month</p>
                <ul className="mt-2 space-y-1 text-left">
                  {["5–Unlimited matches", "Seller contact info", "Priority placement"].map((f) => (
                    <li key={f} className="flex items-center gap-1 text-slate-300 text-xs">
                      <CheckCircle size={10} className="text-blue-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
