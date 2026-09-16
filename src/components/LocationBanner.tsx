import { Locate, CheckCircle, AlertCircle, X } from "lucide-react";
import type { Province } from "@/lib/provinces";

interface LocationBannerProps {
  status: "locating" | "success" | "error" | null;
  detectedProvince?: Province | null;
  distanceKm?: number;
  errorMessage?: string | null;
  onDismiss: () => void;
}

export function LocationBanner({
  status,
  detectedProvince,
  distanceKm,
  errorMessage,
  onDismiss,
}: LocationBannerProps) {
  if (!status) return null;

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-6">
      {status === "locating" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-2">
            <Locate className="size-4 animate-spin" />
            <span>
              កំពុងស្វែងរកទីតាំងបច្ចុប្បន្នរបស់អ្នក... · Detecting your current GPS location in Cambodia...
            </span>
          </div>
        </div>
      )}

      {status === "success" && detectedProvince && (
        <div className="flex items-center justify-between gap-3 rounded-2xl apple-glass border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>
              បានកំណត់ទីតាំងជិតបំផុត: <strong className="font-khmer">{detectedProvince.nameKh}</strong> · {detectedProvince.nameEn}{" "}
              {distanceKm !== undefined ? `(ប្រហែល ${distanceKm} km)` : ""}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-full p-1 hover:bg-emerald-500/20 cursor-pointer apple-press"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {errorMessage ||
                "មិនអាចទាញយកទីតាំង GPS បានទេ។ សូមជ្រើសរើសខេត្តដោយផ្ទាល់ពីបញ្ជី។ · Unable to access GPS location. Please select a province manually."}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="rounded p-1 hover:bg-amber-500/20 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
