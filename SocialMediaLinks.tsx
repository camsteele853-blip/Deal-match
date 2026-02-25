import { useState } from "react";
import { useAppStore, type SocialMediaPlatform } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Share2, Trash2, Plus, ExternalLink, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformConfig {
  platform: SocialMediaPlatform;
  label: string;
  placeholder: string;
  prefix: string;
  color: string;
  bgColor: string;
  icon: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    platform: "twitter",
    label: "X / Twitter",
    placeholder: "username",
    prefix: "https://x.com/",
    color: "text-sky-600",
    bgColor: "bg-sky-50 border-sky-200",
    icon: "𝕏",
  },
  {
    platform: "instagram",
    label: "Instagram",
    placeholder: "username",
    prefix: "https://instagram.com/",
    color: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-200",
    icon: "📸",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    placeholder: "in/your-name",
    prefix: "https://linkedin.com/",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: "in",
  },
  {
    platform: "facebook",
    label: "Facebook",
    placeholder: "username or page",
    prefix: "https://facebook.com/",
    color: "text-blue-600",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: "f",
  },
];

interface Props {
  userId: string;
}

export function SocialMediaLinks({ userId }: Props) {
  const { getSocialMediaLinks, addSocialMediaLink, removeSocialMediaLink } = useAppStore();
  const links = getSocialMediaLinks(userId);

  const [dialogPlatform, setDialogPlatform] = useState<PlatformConfig | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const openDialog = (cfg: PlatformConfig) => {
    const existing = links.find((l) => l.platform === cfg.platform);
    setInputValue(existing?.username ?? "");
    setError("");
    setDialogPlatform(cfg);
  };

  const handleSave = () => {
    if (!dialogPlatform) return;
    const username = inputValue.trim().replace(/^@/, "").replace(/^https?:\/\/[^/]+\//, "");
    if (!username) {
      setError("Please enter a username.");
      return;
    }
    const url = `${dialogPlatform.prefix}${username}`;
    addSocialMediaLink(userId, dialogPlatform.platform, username, url);
    setDialogPlatform(null);
  };

  const handleRemove = (platform: SocialMediaPlatform) => {
    removeSocialMediaLink(userId, platform);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 size={16} className="text-slate-500" />
            Social Media
          </CardTitle>
          <CardDescription>Link your social profiles to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {PLATFORMS.map((cfg) => {
            const linked = links.find((l) => l.platform === cfg.platform);
            return (
              <div
                key={cfg.platform}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  linked ? cfg.bgColor : "bg-white border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border",
                      linked ? `${cfg.color} border-current bg-white` : "text-slate-400 border-slate-300 bg-slate-50"
                    )}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{cfg.label}</p>
                    {linked ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={11} className="text-green-500" />
                        <a
                          href={linked.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn("text-xs font-medium hover:underline flex items-center gap-1", cfg.color)}
                        >
                          @{linked.username}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {linked && (
                    <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                      Linked
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => openDialog(cfg)}
                  >
                    <Plus size={13} className="mr-1" />
                    {linked ? "Edit" : "Link"}
                  </Button>
                  {linked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemove(cfg.platform)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={dialogPlatform !== null} onOpenChange={(o) => !o && setDialogPlatform(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogPlatform
                ? `Link ${dialogPlatform.label}`
                : "Link Social Media"}
            </DialogTitle>
          </DialogHeader>

          {dialogPlatform && (
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-sm font-medium">
                  {dialogPlatform.label} Username
                </Label>
                <div className="flex items-center mt-1.5 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 py-2 bg-slate-100 text-slate-500 text-sm border-r whitespace-nowrap">
                    {dialogPlatform.prefix}
                  </span>
                  <Input
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setError(""); }}
                    placeholder={dialogPlatform.placeholder}
                    className="border-0 focus-visible:ring-0 rounded-none"
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <p className="text-xs text-slate-400">
                Your profile will be visible to your matches on DealMatch.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPlatform(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
