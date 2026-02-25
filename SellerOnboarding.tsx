import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore, type SellerProfile } from "@/store/appStore";
import { Home, MapPin, DollarSign, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

const sellerSchema = z.object({
  propertyType: z.enum(["single_family", "multi_family", "condo", "land", "commercial"]),
  sellingMotivation: z.enum(["job_relocation", "divorce", "foreclosure", "upgrade", "downsizing", "investment", "inherited", "other"]),
  urgencyLevel: z.number().min(1).max(10),
  priceFlexibility: z.enum(["firm", "slight", "moderate", "very_flexible"]),
  askingPrice: z.number().min(1, "Enter a valid asking price"),
  propertyCondition: z.enum(["excellent", "good", "fair", "needs_work", "distressed"]),
  previousListingHistory: z.boolean(),
  previousListingDays: z.number().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  zipCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  propertyAddress: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  squareFeet: z.number().optional(),
  yearBuilt: z.number().optional(),
  description: z.string().optional(),
});

type SellerFormData = z.infer<typeof sellerSchema>;

interface Props {
  onComplete: () => void;
}

const STEPS = ["Property Details", "Motivation & Urgency", "Location & Description"];

export function SellerOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [urgency, setUrgency] = useState(5);
  const { currentUserId, saveSellerProfile, setCurrentView } = useAppStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      urgencyLevel: 5,
      previousListingHistory: false,
    },
  });

  const previousListing = watch("previousListingHistory");

  const STEP_FIELDS: (keyof SellerFormData)[][] = [
    ["propertyType", "askingPrice", "propertyCondition"],
    ["sellingMotivation", "urgencyLevel", "priceFlexibility"],
    ["city", "state", "zipCode", "country"],
  ];

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = (data: SellerFormData) => {
    if (!currentUserId) return;
    const profile: SellerProfile = {
      userId: currentUserId,
      propertyType: data.propertyType,
      sellingMotivation: data.sellingMotivation,
      urgencyLevel: data.urgencyLevel,
      priceFlexibility: data.priceFlexibility,
      askingPrice: data.askingPrice,
      propertyCondition: data.propertyCondition,
      previousListingHistory: data.previousListingHistory,
      previousListingDays: data.previousListingDays,
      location: { city: data.city, state: data.state, zipCode: data.zipCode, country: data.country },
      propertyAddress: data.propertyAddress,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      squareFeet: data.squareFeet,
      yearBuilt: data.yearBuilt,
      description: data.description,
    };
    saveSellerProfile(profile);
    onComplete();
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Home size={16} />
            Seller Profile Setup
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Tell us about your property</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>

        <Progress value={progressPct} className="mb-6 h-2" />

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Property Details */}
          {step === 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home size={20} className="text-blue-600" />
                  Property Details
                </CardTitle>
                <CardDescription>Basic information about your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Property Type</Label>
                  <Select onValueChange={(v) => setValue("propertyType", v as SellerFormData["propertyType"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family Home</SelectItem>
                      <SelectItem value="multi_family">Multi-Family</SelectItem>
                      <SelectItem value="condo">Condo / Townhouse</SelectItem>
                      <SelectItem value="land">Land / Lot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>}
                </div>

                <div>
                  <Label>Asking Price ($)</Label>
                  <div className="relative mt-1">
                    <DollarSign size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="350000"
                      className="pl-8"
                      {...register("askingPrice", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.askingPrice && <p className="text-red-500 text-xs mt-1">{errors.askingPrice.message}</p>}
                </div>

                <div>
                  <Label>Property Condition</Label>
                  <Select onValueChange={(v) => setValue("propertyCondition", v as SellerFormData["propertyCondition"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent — Move-in ready</SelectItem>
                      <SelectItem value="good">Good — Minor updates needed</SelectItem>
                      <SelectItem value="fair">Fair — Some repairs needed</SelectItem>
                      <SelectItem value="needs_work">Needs Work — Major repairs</SelectItem>
                      <SelectItem value="distressed">Distressed — Significant work</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyCondition && <p className="text-red-500 text-xs mt-1">{errors.propertyCondition.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Bedrooms</Label>
                    <Input type="number" placeholder="3" className="mt-1" {...register("bedrooms", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input type="number" placeholder="2" className="mt-1" {...register("bathrooms", { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Square Feet</Label>
                    <Input type="number" placeholder="1800" className="mt-1" {...register("squareFeet", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Year Built</Label>
                    <Input type="number" placeholder="1995" className="mt-1" {...register("yearBuilt", { valueAsNumber: true })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Motivation & Urgency */}
          {step === 1 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Motivation & Urgency</CardTitle>
                <CardDescription>Help us find buyers aligned with your timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Why are you selling?</Label>
                  <Select onValueChange={(v) => setValue("sellingMotivation", v as SellerFormData["sellingMotivation"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select motivation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job_relocation">Job Relocation</SelectItem>
                      <SelectItem value="divorce">Divorce / Separation</SelectItem>
                      <SelectItem value="foreclosure">Foreclosure / Financial Distress</SelectItem>
                      <SelectItem value="upgrade">Upgrading to Larger Home</SelectItem>
                      <SelectItem value="downsizing">Downsizing</SelectItem>
                      <SelectItem value="investment">Liquidating Investment</SelectItem>
                      <SelectItem value="inherited">Inherited Property</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sellingMotivation && <p className="text-red-500 text-xs mt-1">{errors.sellingMotivation.message}</p>}
                </div>

                <div>
                  <Label className="flex items-center justify-between">
                    <span>Urgency Level</span>
                    <Badge variant={urgency >= 8 ? "destructive" : urgency >= 5 ? "default" : "secondary"}>
                      {urgency}/10 — {urgency >= 8 ? "Very Urgent" : urgency >= 5 ? "Moderate" : "Flexible"}
                    </Badge>
                  </Label>
                  <Slider
                    className="mt-3"
                    min={1}
                    max={10}
                    step={1}
                    value={[urgency]}
                    onValueChange={([v]) => {
                      setUrgency(v);
                      setValue("urgencyLevel", v);
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>No rush</span>
                    <span>Need to sell NOW</span>
                  </div>
                </div>

                <div>
                  <Label>Price Flexibility</Label>
                  <Select onValueChange={(v) => setValue("priceFlexibility", v as SellerFormData["priceFlexibility"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How flexible are you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firm">Firm — Price is non-negotiable</SelectItem>
                      <SelectItem value="slight">Slight — Up to 3% below asking</SelectItem>
                      <SelectItem value="moderate">Moderate — Up to 8% below asking</SelectItem>
                      <SelectItem value="very_flexible">Very Flexible — Open to offers</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priceFlexibility && <p className="text-red-500 text-xs mt-1">{errors.priceFlexibility.message}</p>}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Previously listed?</Label>
                    <p className="text-xs text-slate-500">Was this property listed before?</p>
                  </div>
                  <Switch
                    checked={previousListing}
                    onCheckedChange={(v) => setValue("previousListingHistory", v)}
                  />
                </div>

                {previousListing && (
                  <div>
                    <Label>Days on market previously</Label>
                    <Input
                      type="number"
                      placeholder="90"
                      className="mt-1"
                      {...register("previousListingDays", { valueAsNumber: true })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location & Description */}
          {step === 2 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Location & Details
                </CardTitle>
                <CardDescription>Where is your property located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Street Address (optional)</Label>
                  <Input placeholder="123 Main St" className="mt-1" {...register("propertyAddress")} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input placeholder="US" className="mt-1" {...register("country")} defaultValue="US" />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">Use ISO country code (e.g. US, GB, AU, DE, JP)</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input placeholder="Phoenix" className="mt-1" {...register("city")} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <Label>State / Province</Label>
                    <Input placeholder="AZ" className="mt-1" {...register("state")} />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input placeholder="85001" className="mt-1" {...register("zipCode")} />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
                </div>
                <div>
                  <Label>Property Description (optional)</Label>
                  <Textarea
                    placeholder="Describe any notable features, recent upgrades, or anything buyers should know..."
                    className="mt-1 resize-none"
                    rows={3}
                    {...register("description")}
                  />
                </div>

                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-700">
                      After saving, our AI will instantly match you with compatible buyers and investors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-4">
            {step > 0 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} className="mr-1" />
                Back
              </Button>
            )}
            {step === 0 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentView("landing")}>
                Cancel
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleNext}>
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle size={16} className="mr-1" />
                Find My Matches
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
