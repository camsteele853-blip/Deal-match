import { useEffect, useState, useMemo } from "react";
import { useAppStore, type MatchScore, type OffPlatformSeller, type ListingStatus, type PropertyType } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Lock,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  AlertCircle,
  Home,
  Search,
  RefreshCw,
  User,
  MapPin,
  Globe,
  Building2,
  ExternalLink,
  Radio,
  Database,
  Hash,
  Tag,
  Filter,
  SlidersHorizontal,
  Car,
  Waves,
  Ruler,
  CalendarDays,
  Receipt,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const LISTING_STATUS_STYLES: Record<ListingStatus, { label: string; className: string }> = {
  available:  { label: "Available",  className: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  pending:    { label: "Pending",    className: "text-amber-700 bg-amber-50 border-amber-300" },
  sold:       { label: "Sold",       className: "text-slate-600 bg-slate-100 border-slate-300" },
  off_market: { label: "Off Market", className: "text-red-700 bg-red-50 border-red-300" },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

const PLATFORM_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  twitter:   { label: "X / Twitter", bg: "bg-black",       text: "text-white",      border: "border-black" },
  instagram: { label: "Instagram",   bg: "bg-pink-600",    text: "text-white",      border: "border-pink-600" },
  linkedin:  { label: "LinkedIn",    bg: "bg-blue-700",    text: "text-white",      border: "border-blue-700" },
  facebook:  { label: "Facebook",    bg: "bg-blue-600",    text: "text-white",      border: "border-blue-600" },
};

function PublicRecordsPanel({ seller }: { seller: OffPlatformSeller }) {
  const hasPortalLinks = seller.zillowUrl || seller.redfinUrl || seller.realtorComUrl;
  const hasDetails =
    seller.lotSizeSquareFeet ||
    seller.annualPropertyTaxEstimate ||
    seller.hoaMonthlyFee !== undefined ||
    seller.yearBuilt ||
    seller.lastSoldPrice ||
    seller.lastSoldDate ||
    seller.parkingSpaces;

  return (
    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 overflow-hidden">
      {/* Source attribution header */}
      <div className="px-3 py-2 bg-amber-100 border-b border-amber-200 flex items-center gap-2">
        <Database size={12} className="text-amber-700 shrink-0" />
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Public Records &amp; Internet Listings
        </p>
        {seller.mlsNumber && (
          <Badge variant="outline" className="ml-auto text-xs text-amber-700 border-amber-400 bg-amber-50 font-mono py-0">
            MLS# {seller.mlsNumber}
          </Badge>
        )}
        <div className={`flex items-center gap-1 ${seller.mlsNumber ? "" : "ml-auto"}`}>
          <Radio size={10} className="text-amber-500 animate-pulse" />
          <span className="text-xs text-amber-600 font-medium">Live</span>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Portal links */}
        {hasPortalLinks && (
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1.5">View on listing portals:</p>
            <div className="flex flex-wrap gap-2">
              {seller.zillowUrl && (
                <a
                  href={seller.zillowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={11} />
                  Zillow
                </a>
              )}
              {seller.redfinUrl && (
                <a
                  href={seller.redfinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <ExternalLink size={11} />
                  Redfin
                </a>
              )}
              {seller.realtorComUrl && (
                <a
                  href={seller.realtorComUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-700 text-white hover:bg-red-800 transition-colors"
                >
                  <ExternalLink size={11} />
                  Realtor.com
                </a>
              )}
            </div>
          </div>
        )}

        {/* Property details grid */}
        {hasDetails && (
          <div className="grid grid-cols-2 gap-2">
            {seller.lotSizeSquareFeet && (
              <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-amber-100">
                <Ruler size={11} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Lot Size</p>
                  <p className="text-xs font-semibold text-slate-700">{seller.lotSizeSquareFeet.toLocaleString()} sqft</p>
                </div>
              </div>
            )}
            {seller.yearBuilt && (
              <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-amber-100">
                <CalendarDays size={11} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Year Built</p>
                  <p className="text-xs font-semibold text-slate-700">{seller.yearBuilt}</p>
                </div>
              </div>
            )}
            {seller.annualPropertyTaxEstimate && (
              <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-amber-100">
                <Receipt size={11} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Annual Tax</p>
                  <p className="text-xs font-semibold text-slate-700">${seller.annualPropertyTaxEstimate.toLocaleString()}/yr</p>
                </div>
              </div>
            )}
            {seller.hoaMonthlyFee !== undefined && seller.hoaMonthlyFee > 0 && (
              <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-amber-100">
                <Building2 size={11} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">HOA</p>
                  <p className="text-xs font-semibold text-slate-700">${seller.hoaMonthlyFee}/mo</p>
                </div>
              </div>
            )}
            {seller.lastSoldPrice && seller.lastSoldDate && (
              <div className="col-span-2 flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-amber-100">
                <DollarSign size={11} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Last Sold</p>
                  <p className="text-xs font-semibold text-slate-700">
                    ${seller.lastSoldPrice.toLocaleString()} &middot; {seller.lastSoldDate}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1.5">
          {seller.hasPool && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              <Waves size={10} />
              Pool
            </span>
          )}
          {seller.hasGarage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Car size={10} />
              Garage
            </span>
          )}
          {seller.parkingSpaces && seller.parkingSpaces > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Car size={10} />
              {seller.parkingSpaces} Parking
            </span>
          )}
          {seller.hoaMonthlyFee === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={10} />
              No HOA
            </span>
          )}
        </div>

        {/* Social links */}
        {seller.socialLinks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe size={13} className="text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-700">
                Not on DealMatch yet — reach out directly
              </p>
            </div>
            <p className="text-xs text-amber-600 mb-2">
              Connect with <span className="font-medium">{seller.name}</span>:
            </p>
            <div className="flex flex-wrap gap-2">
              {seller.socialLinks.map((link) => {
                const style = PLATFORM_STYLES[link.platform] ?? { label: link.platform, bg: "bg-slate-600", text: "text-white", border: "border-slate-600" };
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} hover:opacity-90 transition-opacity`}
                  >
                    <ExternalLink size={11} />
                    {style.label}
                    <span className="opacity-75">@{link.username}</span>
                  </a>
                );
              })}
              {seller.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={11} />
                  Email
                  <span className="opacity-75">{seller.email}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  userRole,
  counterparty,
  propertyLocation,
  locked,
  index,
  budgetRange,
  offPlatformSeller,
  listingStatus,
}: {
  match: MatchScore;
  userRole: string;
  counterparty: { name: string; email: string } | null;
  propertyLocation: { city: string; state: string; zipCode?: string; country?: string } | null;
  locked: boolean;
  index: number;
  budgetRange?: { min: number; max: number } | null;
  offPlatformSeller?: OffPlatformSeller | null;
  listingStatus?: ListingStatus | null;
}) {
  const score = match.overallScore;
  const scoreColor =
    score >= 80
      ? "text-green-600 bg-green-50 border-green-200"
      : score >= 60
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-slate-600 bg-slate-50 border-slate-200";

  const scoreBadgeVariant = score >= 80 ? "default" : "secondary";

  const locationLabel = propertyLocation
    ? [propertyLocation.city, propertyLocation.state]
        .filter(Boolean)
        .join(", ")
    : null;

  const zipLabel = propertyLocation?.zipCode ?? null;

  const isInternational = propertyLocation?.country && propertyLocation.country !== "US";
  const isSeller = userRole === "seller";
  const isOffPlatform = !!offPlatformSeller;

  return (
    <Card className={`shadow-sm border transition-all ${index === 0 ? "ring-2 ring-blue-400" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {index === 0 && (
              <Badge className="bg-blue-600 text-white text-xs">
                <Zap size={10} className="mr-1" />
                Top Match
              </Badge>
            )}
            <Badge variant={scoreBadgeVariant} className={`text-sm font-bold px-3 py-1 border ${scoreColor}`}>
              {score}% Match
            </Badge>
            {isInternational && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                <Globe size={10} className="mr-1" />
                International
              </Badge>
            )}
            {isOffPlatform && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                <Database size={10} className="mr-1" />
                Public Records
              </Badge>
            )}
            {listingStatus && !isSeller && (
              <Badge variant="outline" className={`text-xs ${LISTING_STATUS_STYLES[listingStatus].className}`}>
                <Tag size={10} className="mr-1" />
                {LISTING_STATUS_STYLES[listingStatus].label}
              </Badge>
            )}
          </div>
          {match.closingProbabilityScore >= 80 && (
            <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
              <CheckCircle size={10} className="mr-1" />
              High probability
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOffPlatform ? "bg-amber-100" : "bg-slate-200"}`}>
            <User size={16} className={isOffPlatform ? "text-amber-600" : "text-slate-500"} />
          </div>
          {locked ? (
            <div>
              <p className="font-medium text-slate-800 flex items-center gap-1">
                <Lock size={14} className="text-slate-400" />
                {isSeller ? "Buyer" : "Property Seller"} #{index + 1}
              </p>
              <p className="text-xs text-slate-400">Upgrade to see contact info</p>
            </div>
          ) : isOffPlatform ? (
            <div>
              <p className="font-medium text-slate-800">{offPlatformSeller.name}</p>
              {offPlatformSeller.propertyAddress && (
                <p className="text-xs text-slate-500 font-mono">{offPlatformSeller.propertyAddress}</p>
              )}
              <p className="text-xs text-amber-600">Connect via links below</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-slate-800">{counterparty?.name ?? "Unknown"}</p>
              <p className="text-xs text-slate-500">{counterparty?.email ?? ""}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {locationLabel && (
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500">
                {isSeller ? `Target: ${locationLabel}` : locationLabel}
              </p>
            </div>
          )}
          {zipLabel && (
            <div className="flex items-center gap-1">
              <Hash size={11} className="text-slate-300 shrink-0" />
              <p className="text-xs text-slate-400 font-mono">{zipLabel}</p>
            </div>
          )}
          {isSeller && budgetRange && (
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500">
                Budget: ${budgetRange.min.toLocaleString()}–${budgetRange.max.toLocaleString()}
              </p>
            </div>
          )}
          {/* Property details inline for off-platform listings */}
          {isOffPlatform && offPlatformSeller.squareFeet && (
            <div className="flex items-center gap-1">
              <Ruler size={11} className="text-slate-300 shrink-0" />
              <p className="text-xs text-slate-400">{offPlatformSeller.squareFeet.toLocaleString()} sqft</p>
            </div>
          )}
          {isOffPlatform && offPlatformSeller.bedrooms && offPlatformSeller.bathrooms && (
            <div className="flex items-center gap-1">
              <Home size={11} className="text-slate-300 shrink-0" />
              <p className="text-xs text-slate-400">
                {offPlatformSeller.bedrooms}bd / {offPlatformSeller.bathrooms}ba
              </p>
            </div>
          )}
        </div>

        {/* Asking price for off-platform listings */}
        {isOffPlatform && !isSeller && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-base font-bold text-slate-800">
              ${offPlatformSeller.askingPrice.toLocaleString()}
            </span>
            {offPlatformSeller.askingPrice && offPlatformSeller.squareFeet && (
              <span className="text-xs text-slate-400">
                ${Math.round(offPlatformSeller.askingPrice / offPlatformSeller.squareFeet)}/sqft
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <ScoreBar label="Financial Compatibility" score={match.financialScore} color="bg-emerald-500" />
          <ScoreBar label="Urgency Alignment" score={match.urgencyScore} color="bg-blue-500" />
          <ScoreBar label="Seller Motivation" score={match.motivationScore} color="bg-purple-500" />
          <ScoreBar label="Closing Probability" score={match.closingProbabilityScore} color="bg-orange-500" />
        </div>

        {match.keyAlignmentFactors.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Alignment Factors</p>
              <div className="flex flex-wrap gap-1.5">
                {match.keyAlignmentFactors.map((factor, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-slate-600">
                    <CheckCircle size={10} className="mr-1 text-green-500" />
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {locked && (
          <div className="p-2.5 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
            <Lock size={14} className="mx-auto text-slate-400 mb-1" />
            <p className="text-xs text-slate-500">Subscribe to unlock contact information and all match details</p>
          </div>
        )}

        {/* Public records panel for off-platform sellers */}
        {!locked && offPlatformSeller && (
          <PublicRecordsPanel seller={offPlatformSeller} />
        )}
      </CardContent>
    </Card>
  );
}

function LockedMatchesOverlay({ plan, onUpgrade }: { plan: string; onUpgrade: () => void }) {
  return (
    <div className="relative mt-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <Lock size={24} className="text-slate-500" />
        </div>
        <h3 className="font-bold text-slate-800 mb-1">
          {plan === "expired" ? "Trial Expired" : "Subscription Required"}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {plan === "expired"
            ? "Your free trial has ended. Subscribe to continue accessing matches."
            : "Subscribe to unlock all matches and contact information."}
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onUpgrade}>
          <TrendingUp size={16} className="mr-2" />
          View Plans — From $99/mo
        </Button>
      </div>
      {/* Blurred preview cards */}
      <div className="space-y-3 blur-sm pointer-events-none">
        {[75, 62, 58].map((score, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="py-4">
              <div className="flex justify-between items-center mb-3">
                <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-full bg-emerald-200 rounded-full" style={{ width: `${score}%` }} />
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-full bg-blue-200 rounded-full" style={{ width: `${score - 10}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Filter state for buyer match views
interface BuyerFilters {
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  propertyType: PropertyType | "all";
  listingStatus: ListingStatus | "all";
  sortBy: "score" | "price_asc" | "price_desc" | "beds_desc";
}

const DEFAULT_FILTERS: BuyerFilters = {
  minPrice: "",
  maxPrice: "",
  minBeds: "",
  propertyType: "all",
  listingStatus: "all",
  sortBy: "score",
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  land: "Land",
  commercial: "Commercial",
};

function BuyerFiltersPanel({
  filters,
  onChange,
  onReset,
  activeCount,
}: {
  filters: BuyerFilters;
  onChange: (f: Partial<BuyerFilters>) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="py-3 px-4">
        <button
          type="button"
          className="w-full flex items-center gap-2 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <SlidersHorizontal size={15} className="text-slate-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-700">Filter &amp; Sort Matches</span>
          {activeCount > 0 && (
            <Badge className="ml-1 bg-blue-600 text-white text-xs h-5 px-1.5">{activeCount}</Badge>
          )}
          <span className="ml-auto text-slate-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {/* Price range */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Price Range</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice}
                  onChange={(e) => onChange({ minPrice: e.target.value })}
                  className="h-8 text-xs"
                />
                <span className="text-slate-400 text-xs">to</span>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ maxPrice: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Min beds */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Min Bedrooms</p>
              <Select value={filters.minBeds || "any"} onValueChange={(v) => onChange({ minBeds: v === "any" ? "" : v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property type */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Property Type</p>
              <Select
                value={filters.propertyType}
                onValueChange={(v) => onChange({ propertyType: v as PropertyType | "all" })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
                    <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Listing status */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Listing Status</p>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "available", "pending", "sold", "off_market"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ listingStatus: s })}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      filters.listingStatus === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : s === "all"
                          ? "border-slate-300 text-slate-600 hover:border-slate-400"
                          : `${LISTING_STATUS_STYLES[s].className} hover:opacity-80`
                    }`}
                  >
                    {s === "all" ? "All" : LISTING_STATUS_STYLES[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Sort By</p>
              <Select value={filters.sortBy} onValueChange={(v) => onChange({ sortBy: v as BuyerFilters["sortBy"] })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Best Match Score</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="beds_desc">Most Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset */}
            {activeCount > 0 && (
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
                onClick={onReset}
              >
                <X size={13} />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  onNavigateToAccount: () => void;
  onNavigateToOnboarding: () => void;
}

export function MatchDashboard({ onNavigateToAccount, onNavigateToOnboarding }: Props) {
  const {
    getCurrentUser,
    getMatchesForUser,
    getUnreadAlerts,
    markAlertRead,
    canAccessMatches,
    isTrialExpired,
    computeMatches,
    getBuyerProfile,
    getSellerProfile,
    getOffPlatformSeller,
    users,
    sellerProfiles,
    buyerProfiles,
    offPlatformSellers,
  } = useAppStore();

  const user = getCurrentUser();

  const [buyerFilters, setBuyerFilters] = useState<BuyerFilters>(DEFAULT_FILTERS);

  // Recompute matches on mount so returning users always see fresh results
  useEffect(() => {
    if (user) {
      computeMatches(user.userId);
    }
  }, [user?.userId]);

  if (!user) return null;

  const matches = getMatchesForUser(user.userId);
  const alerts = getUnreadAlerts(user.userId);
  const canAccess = canAccessMatches(user.userId);
  const trialExpired = isTrialExpired(user.userId);

  const trialDaysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(user.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const isSeller = user.role === "seller";
  const sellerProfile = isSeller ? getSellerProfile(user.userId) : null;
  const lockedMatches = !isSeller && !canAccess;

  // Resolve the off-platform seller for a match
  const resolveOffPlatformSeller = (match: MatchScore) =>
    !isSeller && match.offPlatformSellerId
      ? getOffPlatformSeller(match.offPlatformSellerId)
      : null;

  // Resolve listing status for a match
  const resolveListingStatus = (match: MatchScore): ListingStatus | null => {
    if (isSeller) return null;
    const ext = resolveOffPlatformSeller(match);
    if (ext?.listingStatus) return ext.listingStatus;
    return sellerProfiles.find((p) => p.userId === match.sellerId)?.listingStatus ?? null;
  };

  // Count active buyer filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (buyerFilters.minPrice) count++;
    if (buyerFilters.maxPrice) count++;
    if (buyerFilters.minBeds) count++;
    if (buyerFilters.propertyType !== "all") count++;
    if (buyerFilters.listingStatus !== "all") count++;
    if (buyerFilters.sortBy !== "score") count++;
    return count;
  }, [buyerFilters]);

  // Apply buyer filters and sort
  const filteredMatches = useMemo(() => {
    if (isSeller) return matches;

    let result = matches.filter((match) => {
      const ext = resolveOffPlatformSeller(match);
      const price = ext?.askingPrice ?? sellerProfiles.find((p) => p.userId === match.sellerId)?.askingPrice;
      const beds = ext?.bedrooms ?? undefined;
      const type = ext?.propertyType ?? sellerProfiles.find((p) => p.userId === match.sellerId)?.propertyType;
      const status = resolveListingStatus(match);

      if (buyerFilters.minPrice && price !== undefined && price < Number(buyerFilters.minPrice)) return false;
      if (buyerFilters.maxPrice && price !== undefined && price > Number(buyerFilters.maxPrice)) return false;
      if (buyerFilters.minBeds && beds !== undefined && beds < Number(buyerFilters.minBeds)) return false;
      if (buyerFilters.propertyType !== "all" && type && type !== buyerFilters.propertyType) return false;
      if (buyerFilters.listingStatus !== "all" && status && status !== buyerFilters.listingStatus) return false;

      return true;
    });

    // Sort
    if (buyerFilters.sortBy === "price_asc") {
      result = result.slice().sort((a, b) => {
        const ap = resolveOffPlatformSeller(a)?.askingPrice ?? sellerProfiles.find((p) => p.userId === a.sellerId)?.askingPrice ?? 0;
        const bp = resolveOffPlatformSeller(b)?.askingPrice ?? sellerProfiles.find((p) => p.userId === b.sellerId)?.askingPrice ?? 0;
        return ap - bp;
      });
    } else if (buyerFilters.sortBy === "price_desc") {
      result = result.slice().sort((a, b) => {
        const ap = resolveOffPlatformSeller(a)?.askingPrice ?? sellerProfiles.find((p) => p.userId === a.sellerId)?.askingPrice ?? 0;
        const bp = resolveOffPlatformSeller(b)?.askingPrice ?? sellerProfiles.find((p) => p.userId === b.sellerId)?.askingPrice ?? 0;
        return bp - ap;
      });
    } else if (buyerFilters.sortBy === "beds_desc") {
      result = result.slice().sort((a, b) => {
        const ab = resolveOffPlatformSeller(a)?.bedrooms ?? 0;
        const bb = resolveOffPlatformSeller(b)?.bedrooms ?? 0;
        return bb - ab;
      });
    }
    // "score" is already the default order from the store

    return result;
  }, [matches, buyerFilters, isSeller, sellerProfiles, offPlatformSellers]);

  const visibleMatches = isSeller
    ? filteredMatches
    : canAccess
      ? filteredMatches.slice(0, 5)
      : filteredMatches.slice(0, 1);

  const getCounterparty = (match: MatchScore) => {
    const id = isSeller ? match.buyerId : match.sellerId;
    return users.find((u) => u.userId === id) ?? null;
  };

  const getPropertyLocation = (match: MatchScore) => {
    if (isSeller) {
      const buyerProfile = buyerProfiles.find((p) => p.userId === match.buyerId);
      if (buyerProfile && buyerProfile.locationPreferences.length > 0) {
        return buyerProfile.locationPreferences[0];
      }
      return null;
    }
    if (match.offPlatformSellerId) {
      const extSeller = getOffPlatformSeller(match.offPlatformSellerId);
      return extSeller ? extSeller.location : null;
    }
    const profile = sellerProfiles.find((p) => p.userId === match.sellerId);
    return profile ? profile.location : null;
  };

  // For buyers: compute local match counts per target area
  const buyerProfile = !isSeller ? getBuyerProfile(user.userId) : null;
  const localAreaCounts: { label: string; count: number }[] = [];
  if (buyerProfile && buyerProfile.locationPreferences.length > 0) {
    for (const pref of buyerProfile.locationPreferences) {
      const count = matches.filter((m) => {
        const loc = m.offPlatformSellerId
          ? offPlatformSellers.find((s) => s.id === m.offPlatformSellerId)?.location
          : sellerProfiles.find((p) => p.userId === m.sellerId)?.location;
        if (!loc) return false;
        return loc.city.toLowerCase() === pref.city.toLowerCase() &&
          loc.state.toLowerCase() === pref.state.toLowerCase();
      }).length;
      const label = `${pref.city}, ${pref.state}`;
      if (!localAreaCounts.find((a) => a.label === label)) {
        localAreaCounts.push({ label, count });
      }
    }
  }

  // Compute unique zip codes covered across all matches
  const matchZipCodes = new Set<string>();
  for (const m of matches) {
    const loc = m.offPlatformSellerId
      ? offPlatformSellers.find((s) => s.id === m.offPlatformSellerId)?.location
      : isSeller
        ? buyerProfiles.find((p) => p.userId === m.buyerId)?.locationPreferences[0]
        : sellerProfiles.find((p) => p.userId === m.sellerId)?.location;
    if (loc?.zipCode) matchZipCodes.add(loc.zipCode);
  }
  const uniqueZipCount = matchZipCodes.size;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSeller ? "bg-blue-100" : "bg-emerald-100"}`}>
              {isSeller ? <Home size={16} className="text-blue-600" /> : <Search size={16} className="text-emerald-600" />}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <button
                type="button"
                className="relative p-2 rounded-full hover:bg-slate-100"
                onClick={() => alerts.forEach((a) => markAlertRead(a.id))}
              >
                <Bell size={18} className="text-slate-600" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={onNavigateToAccount}>
              <User size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Trial/Subscription Status Banner */}
        {user.subscriptionStatus === "trial" && !trialExpired && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock size={16} className="text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              <span className="font-medium">{trialDaysLeft} days left</span> in your free trial.{" "}
              <button
                type="button"
                className="underline font-medium"
                onClick={onNavigateToAccount}
              >
                Subscribe to keep access
              </button>
            </AlertDescription>
          </Alert>
        )}

        {trialExpired && user.subscriptionStatus !== "active" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle size={16} className="text-red-600" />
            <AlertDescription className="text-red-700 text-sm">
              Your free trial has expired.{" "}
              <button
                type="button"
                className="underline font-medium"
                onClick={onNavigateToAccount}
              >
                Subscribe now
              </button>{" "}
              to regain access.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 shadow-none">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">
                  <span className="font-medium">{alerts.length} new match alert{alerts.length > 1 ? "s" : ""}</span> since your last visit
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seller property summary card */}
        {isSeller && sellerProfile && (
          <Card className="shadow-none border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Your Listed Property</p>
                    {sellerProfile.listingStatus && (
                      <Badge variant="outline" className={`text-xs ${LISTING_STATUS_STYLES[sellerProfile.listingStatus].className}`}>
                        <Tag size={10} className="mr-1" />
                        {LISTING_STATUS_STYLES[sellerProfile.listingStatus].label}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {sellerProfile.propertyAddress ?? `${sellerProfile.location.city}, ${sellerProfile.location.state}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ${sellerProfile.askingPrice.toLocaleString()} &middot;{" "}
                    {sellerProfile.propertyType.replace(/_/g, " ")} &middot;{" "}
                    {sellerProfile.location.city}, {sellerProfile.location.state}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={onNavigateToOnboarding}>
                  <RefreshCw size={12} className="mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seller has no profile yet */}
        {isSeller && !sellerProfile && (
          <Card className="shadow-sm border-dashed border-blue-300">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home size={20} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1 text-sm">No property listed yet</h3>
              <p className="text-xs text-slate-400 mb-3">Complete your seller profile to start getting matched with buyers.</p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onNavigateToOnboarding}>
                List Your Property
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isSeller ? "Buyer Matches" : "Your Matches"}
            </h2>
            <p className="text-sm text-slate-500">
              {filteredMatches.length > 0
                ? `${filteredMatches.length} ${filteredMatches.length !== matches.length ? `of ${matches.length} ` : ""}compatible ${isSeller ? "buyer" : "propert"}${filteredMatches.length !== 1 ? "s" : isSeller ? "" : "y"} found`
                : matches.length > 0
                  ? "No matches for current filters"
                  : "No matches yet"}
            </p>
          </div>
          {(!isSeller || sellerProfile) && (
            <Button variant="outline" size="sm" onClick={onNavigateToOnboarding}>
              <RefreshCw size={14} className="mr-1" />
              {isSeller ? "Update Listing" : "Update Profile"}
            </Button>
          )}
        </div>

        {/* Stats Row */}
        {matches.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-none">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{matches.length}</p>
                <p className="text-xs text-slate-500">Matches Found</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {matches[0]?.overallScore ?? 0}%
                </p>
                <p className="text-xs text-slate-500">Top Score</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-violet-600">
                  {uniqueZipCount}
                </p>
                <p className="text-xs text-slate-500">ZIP Codes</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {matches.filter((m) => !!m.offPlatformSellerId).length}
                </p>
                <p className="text-xs text-slate-500">Public Records</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Local area breakdown for buyers */}
        {!isSeller && localAreaCounts.length > 0 && matches.length > 0 && (
          <Card className="shadow-none border-slate-200">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-slate-500 shrink-0" />
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Local Sellers by Area</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {localAreaCounts.map(({ label, count }) => (
                  <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                    <MapPin size={10} className="text-emerald-600" />
                    <span className="text-xs text-emerald-800 font-medium">{label}</span>
                    <span className="text-xs text-emerald-600 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Buyer filter/sort panel */}
        {!isSeller && matches.length > 0 && (
          <BuyerFiltersPanel
            filters={buyerFilters}
            onChange={(partial) => setBuyerFilters((prev) => ({ ...prev, ...partial }))}
            onReset={() => setBuyerFilters(DEFAULT_FILTERS)}
            activeCount={activeFilterCount}
          />
        )}

        {/* No matches state */}
        {matches.length === 0 && (!isSeller || sellerProfile) && (
          <Card className="shadow-sm">
            <CardContent className="py-10 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {isSeller ? <Search size={28} className="text-slate-400" /> : <Home size={28} className="text-slate-400" />}
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">No matches yet</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {isSeller
                  ? "No buyers match your property criteria yet. Try adjusting your price flexibility or check back soon."
                  : "Complete your buyer profile to see matching seller properties."}
              </p>
              <Button className="mt-4" variant="outline" size="sm" onClick={onNavigateToOnboarding}>
                {isSeller ? "Update Listing" : "Complete Profile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filtered empty state */}
        {filteredMatches.length === 0 && matches.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Filter size={20} className="text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1 text-sm">No matches for your filters</h3>
              <p className="text-xs text-slate-400 mb-3">Try broadening your price range, beds, or removing status filters.</p>
              <Button variant="outline" size="sm" onClick={() => setBuyerFilters(DEFAULT_FILTERS)}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Match Cards */}
        {visibleMatches.length > 0 && (
          <div className="space-y-3">
            {visibleMatches.map((match, i) => {
              const matchedBuyerProfile = isSeller
                ? buyerProfiles.find((p) => p.userId === match.buyerId)
                : null;
              const offPlatformSeller = resolveOffPlatformSeller(match);
              const resolvedListingStatus = resolveListingStatus(match);
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  userRole={user.role}
                  counterparty={getCounterparty(match)}
                  propertyLocation={getPropertyLocation(match)}
                  locked={!isSeller && !canAccess}
                  index={i}
                  budgetRange={
                    matchedBuyerProfile
                      ? { min: matchedBuyerProfile.budgetMin, max: matchedBuyerProfile.budgetMax }
                      : null
                  }
                  offPlatformSeller={offPlatformSeller}
                  listingStatus={resolvedListingStatus}
                />
              );
            })}
          </div>
        )}

        {/* Locked overlay for buyers without subscription */}
        {lockedMatches && matches.length > 1 && (
          <LockedMatchesOverlay
            plan={trialExpired ? "expired" : "free"}
            onUpgrade={onNavigateToAccount}
          />
        )}

        {/* Subscription CTA for buyers with access */}
        {!isSeller && canAccess && user.subscriptionStatus !== "active" && (
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-none">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">Upgrade for unlimited access</p>
                  <p className="text-xs text-slate-500">From $99/month — cancel anytime</p>
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={onNavigateToAccount}>
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Off-platform seller recruitment banner */}
        {matches.filter((m) => !!m.offPlatformSellerId).length > 0 && (
          <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 shadow-none">
            <CardContent className="py-4 px-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Database size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">
                    {matches.filter((m) => !!m.offPlatformSellerId).length} sellers found via public records &amp; internet listings
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These sellers match your ZIP codes but haven't joined DealMatch yet. Reach out via their public profiles — or invite them to list here for free.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash size={11} className="text-violet-500" />
                    <p className="text-xs text-violet-700 font-medium">
                      {uniqueZipCount} ZIP code{uniqueZipCount !== 1 ? "s" : ""} matched across on-platform &amp; off-platform sellers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seller benefit reminder */}
        {isSeller && (
          <Card className="border-blue-100 bg-blue-50 shadow-none">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Seller accounts are always <span className="font-semibold">free</span>. All your buyer matches and contact information are included at no cost.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
