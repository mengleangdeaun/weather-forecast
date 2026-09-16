import { useState, useMemo } from "react";
import {
  CAMBODIA_PROVINCES,
  CAMBODIA_REGIONS,
  type Province,
} from "@/lib/provinces";
import type { WeatherData } from "@/lib/weather-api";
import { Search, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProvinceSelectorProps {
  activeProvince: Province;
  onSelectProvince: (province: Province) => void;
  weatherMap: Record<string, WeatherData>;
}

export function ProvinceSelector({
  activeProvince,
  onSelectProvince,
  weatherMap,
}: ProvinceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const filteredProvinces = useMemo(() => {
    return CAMBODIA_PROVINCES.filter((p) => {
      // Region filter
      if (selectedRegion !== "all" && p.region !== selectedRegion) {
        return false;
      }
      // Text search filter (Khmer or English)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchKh = p.nameKh.includes(query);
        const matchEn = p.nameEn.toLowerCase().includes(query);
        const matchCapital = p.capitalEn.toLowerCase().includes(query) || p.capitalKh.includes(query);
        return matchKh || matchEn || matchCapital;
      }
      return true;
    });
  }, [searchQuery, selectedRegion]);

  return (
    <div className="space-y-4 rounded-3xl apple-glass p-5 sm:p-6 shadow-xl">
      {/* Header & Apple-style Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 tracking-tight">
            <MapPin className="size-4 text-primary" />
            <span className="font-khmer">ជ្រើសរើសរាជធានី-ខេត្ត</span>
            <span className="text-muted-foreground font-normal text-xs">
              · Select Province
            </span>
          </h3>
          <p className="text-[11px] text-muted-foreground/90 font-medium">
            សរុប {filteredProvinces.length} ក្នុងចំណោម ២៥ រាជធានី-ខេត្តនៃកម្ពុជា
          </p>
        </div>

        {/* Apple frosted search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរក / Search province..."
            className="w-full rounded-full border border-border/80 bg-background/70 py-1.5 pl-9 pr-8 text-[16px] sm:text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-md transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer apple-press"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Region tabs (Apple Segmented Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CAMBODIA_REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          return (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-all apple-press cursor-pointer border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                  : "bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              <span className="font-khmer">{region.labelKh}</span>
              <span className="opacity-50 ml-1">· {region.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Province chips grid with ScrollArea */}
      <ScrollArea className="h-68 sm:h-72 w-full pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pt-1 pb-2">
          {filteredProvinces.map((prov) => {
            const isActive = prov.id === activeProvince.id;
            const weather = weatherMap[prov.queryParam.toLowerCase()];
            const temp = weather ? `${Math.round(weather.temp_c)}°C` : null;

            return (
              <button
                key={prov.id}
                onClick={() => onSelectProvince(prov)}
                className={cn(
                  "group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-all apple-press cursor-pointer border",
                  isActive
                    ? "bg-primary/20 border-primary text-primary font-semibold shadow-xs ring-1 ring-primary/40"
                    : "bg-card/60 hover:bg-card/90 border-border/60 text-foreground hover:border-border shadow-2xs"
                )}
              >
                <div className="truncate pr-1">
                  <div className="text-xs font-semibold leading-snug py-0.5 font-khmer">
                    {prov.nameKh}
                  </div>
                  <div className="text-[10px] text-muted-foreground/80 truncate tracking-tight">
                    {prov.nameEn}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {temp && (
                    <span className="text-[11px] font-mono font-medium text-foreground/90">
                      {temp}
                    </span>
                  )}
                  {isActive && (
                    <div className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                      <Check className="size-2.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredProvinces.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground font-medium">
            រកមិនឃើញរាជធានី-ខេត្តដែលត្រូវគ្នានឹង &quot;{searchQuery}&quot; ទេ · No provinces matching query
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
