import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore, type BuyerProfile, type PropertyType, type Location } from "@/store/appStore";
import { Search, DollarSign, ChevronRight, ChevronLeft, CheckCircle, TrendingUp, MapPin, Plus, X } from "lucide-react";

const buyerSchema = z.object({
  budgetMin: z.number().min(1, "Enter minimum budget"),
  budgetMax: z.number().min(1, "Enter maximum budget"),
  purchaseUrgency: z.number().min(1).max(10),
  financingMethod: z.enum(["cash", "conventional", "fha", "va", "hard_money", "seller_financing"]),
  renovationTolerance: z.enum(["none", "minor", "moderate", "major", "any"]),
  isInvestor: z.boolean(),
  minROI: z.number().min(0).optional(),
  strategy: z.enum(["flip", "rental", "wholesale", "primary_residence"]).optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  zipCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "land", label: "Land/Lot" },
  { value: "commercial", label: "Commercial" },
];

const STEPS = ["Budget & Financing", "Preferences", "Location & Criteria"];

interface Props {
  onComplete: () => void;
}

export function BuyerOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [urgency, setUrgency] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>([]);
  const [extraLocations, setExtraLocations] = useState<Location[]>([]);
  const [addingLocation, setAddingLocation] = useState(false);
  const [newLocCity, setNewLocCity] = useState("");
  const [newLocState, setNewLocState] = useState("");
  const [newLocZip, setNewLocZip] = useState("");
  const { currentUserId, saveBuyerProfile, setCurrentView } = useAppStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      purchaseUrgency: 5,
      isInvestor: false,
      minROI: 8,
    },
  });

  const isInvestor = watch("isInvestor");

  const togglePropertyType = (type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addExtraLocation = () => {
    if (!newLocCity.trim() || !newLocState.trim() || !newLocZip.trim()) return;
    setExtraLocations((prev) => [
      ...prev,
      { city: newLocCity.trim(), state: newLocState.trim().toUpperCase(), zipCode: newLocZip.trim(), country: "US" },
    ]);
    setNewLocCity("");
    setNewLocState("");
    setNewLocZip("");
    setAddingLocation(false);
  };

  const removeExtraLocation = (index: number) => {
    setExtraLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: BuyerFormData) => {
    if (!currentUserId) return;
    const primaryLocation: Location = {
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
    };
    const profile: BuyerProfile = {
      userId: currentUserId,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      locationPreferences: [primaryLocation, ...extraLocations],
      propertyTypePreferences: selectedTypes,
      purchaseUrgency: data.purchaseUrgency,
      financingMethod: data.financingMethod,
      renovationTolerance: data.renovationTolerance,
      investmentCriteria: {
        minROI: data.minROI ?? 0,
        strategy: data.strategy ?? "primary_residence",
      },
      isInvestor: data.isInvestor,
    };
    saveBuyerProfile(profile);
    onComplete();
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Search size={16} />
            Buyer / Investor Profile
          </div>
          <h1 className="text-2xl font-bold text-slate-800">What are you looking for?</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>

        <Progress value={progressPct} className="mb-6 h-2" />

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Budget & Financing */}
          {step === 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-600" />
                  Budget & Financing
                </CardTitle>
                <CardDescription>Your purchasing power helps us find the right deals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min Budget ($)</Label>
                    <div className="relative mt-1">
                      <DollarSign size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <Input
                        type="number"
                        placeholder="100000"
                        className="pl-7"
                        {...register("budgetMin", { valueAsNumber: true })}
                      />
                    </div>
                    {errors.budgetMin && <p className="text-red-500 text-xs mt-1">{errors.budgetMin.message}</p>}
                  </div>
                  <div>
                    <Label>Max Budget ($)</Label>
                    <div className="relative mt-1">
                      <DollarSign size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <Input
                        type="number"
                        placeholder="500000"
                        className="pl-7"
                        {...register("budgetMax", { valueAsNumber: true })}
                      />
                    </div>
                    {errors.budgetMax && <p className="text-red-500 text-xs mt-1">{errors.budgetMax.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Financing Method</Label>
                  <Select onValueChange={(v) => setValue("financingMethod", v as BuyerFormData["financingMethod"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How will you purchase?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash — Fastest close</SelectItem>
                      <SelectItem value="conventional">Conventional Loan</SelectItem>
                      <SelectItem value="fha">FHA Loan</SelectItem>
                      <SelectItem value="va">VA Loan</SelectItem>
                      <SelectItem value="hard_money">Hard Money Loan</SelectItem>
                      <SelectItem value="seller_financing">Seller Financing</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.financingMethod && <p className="text-red-500 text-xs mt-1">{errors.financingMethod.message}</p>}
                </div>

                <div>
                  <Label>Renovation Tolerance</Label>
                  <Select onValueChange={(v) => setValue("renovationTolerance", v as BuyerFormData["renovationTolerance"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How much work will you accept?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None — Move-in ready only</SelectItem>
                      <SelectItem value="minor">Minor — Cosmetic updates OK</SelectItem>
                      <SelectItem value="moderate">Moderate — Some repairs OK</SelectItem>
                      <SelectItem value="major">Major — Heavy rehab OK</SelectItem>
                      <SelectItem value="any">Any — Including distressed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.renovationTolerance && <p className="text-red-500 text-xs mt-1">{errors.renovationTolerance.message}</p>}
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Checkbox
                    id="isInvestor"
                    checked={isInvestor}
                    onCheckedChange={(v) => setValue("isInvestor", !!v)}
                  />
                  <label htmlFor="isInvestor" className="cursor-pointer">
                    <div className="font-medium text-sm flex items-center gap-1">
                      <TrendingUp size={14} className="text-emerald-600" />
                      I am an investor
                    </div>
                    <p className="text-xs text-slate-500">Unlock ROI and strategy matching</p>
                  </label>
                </div>

                {isInvestor && (
                  <div className="space-y-3 pl-2 border-l-2 border-emerald-200">
                    <div>
                      <Label>Minimum ROI (%)</Label>
                      <Input
                        type="number"
                        placeholder="8"
                        className="mt-1"
                        {...register("minROI", { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>Investment Strategy</Label>
                      <Select onValueChange={(v) => setValue("strategy", v as BuyerFormData["strategy"])}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flip">Fix & Flip</SelectItem>
                          <SelectItem value="rental">Buy & Hold (Rental)</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="primary_residence">Primary Residence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 1: Property Preferences */}
          {step === 1 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Property Preferences</CardTitle>
                <CardDescription>What types of properties interest you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="mb-3 block">Property Types (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => togglePropertyType(type.value)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                          selectedTypes.includes(type.value)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Leave empty to match all types</p>
                </div>

                <div>
                  <Label className="flex items-center justify-between">
                    <span>Purchase Urgency</span>
                    <Badge variant={urgency >= 8 ? "destructive" : urgency >= 5 ? "default" : "secondary"}>
                      {urgency}/10 — {urgency >= 8 ? "Ready to buy now" : urgency >= 5 ? "Actively looking" : "Exploring"}
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
                      setValue("purchaseUrgency", v);
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Just browsing</span>
                    <span>Ready to close fast</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-600" />
                  Target Locations
                </CardTitle>
                <CardDescription>Add all areas where you want to find deals — more areas = more local matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary location */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Primary Area</p>
                  <div>
                    <Label>Country</Label>
                    <Input placeholder="US" className="mt-1" {...register("country")} defaultValue="US" />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">Use ISO country code (e.g. US, GB, AU)</p>
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
                </div>

                {/* Extra locations */}
                {extraLocations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Additional Areas</p>
                    {extraLocations.map((loc, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 flex-1">
                          {loc.city}, {loc.state} {loc.zipCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExtraLocation(i)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add another location */}
                {addingLocation ? (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <p className="text-xs font-semibold text-slate-600">Add Another Area</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">City</Label>
                        <Input
                          placeholder="Miami"
                          className="mt-1 h-8 text-sm"
                          value={newLocCity}
                          onChange={(e) => setNewLocCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">State</Label>
                        <Input
                          placeholder="FL"
                          className="mt-1 h-8 text-sm"
                          value={newLocState}
                          onChange={(e) => setNewLocState(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Postal Code</Label>
                      <Input
                        placeholder="33101"
                        className="mt-1 h-8 text-sm"
                        value={newLocZip}
                        onChange={(e) => setNewLocZip(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                        onClick={addExtraLocation}
                        disabled={!newLocCity.trim() || !newLocState.trim() || !newLocZip.trim()}
                      >
                        <CheckCircle size={12} className="mr-1" />
                        Add Area
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => {
                          setAddingLocation(false);
                          setNewLocCity("");
                          setNewLocState("");
                          setNewLocZip("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingLocation(true)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Add another target area
                  </button>
                )}

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">{1 + extraLocations.length} area{extraLocations.length > 0 ? "s" : ""} selected.</span>{" "}
                      Our AI surfaces local sellers in each area — adding more areas gives you more matches.
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
              <Button type="button" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(s => s + 1)}>
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
