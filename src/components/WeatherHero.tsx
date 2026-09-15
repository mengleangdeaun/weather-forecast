import type { Province } from "@/lib/provinces";
import {
  type WeatherData,
  getKhmerWeatherCondition,
  getWeatherAtmosphere,
} from "@/lib/weather-api";
import { cn } from "@/lib/utils";
import {
  Clock,
  Thermometer,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface WeatherHeroProps {
  province: Province;
  weather: WeatherData | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function WeatherHero({
  province,
  weather,
  isLoading,
  onRefresh,
}: WeatherHeroProps) {
  if (isLoading && !weather) {
    return (
      <div className="relative overflow-hidden rounded-3xl apple-glass p-4 sm:p-6 lg:p-8 shadow-xl animate-pulse">
        <div className="h-5 w-40 bg-muted/60 rounded-full mb-3" />
        <div className="h-16 sm:h-24 w-36 sm:w-44 bg-muted/60 rounded-3xl mb-4" />
        <div className="h-4 w-52 bg-muted/60 rounded-full" />
      </div>
    );
  }

  if (!weather) return null;

  const temp = Math.round(weather.temp_c);
  const feelsLike = Math.round(weather.feelslike_c);
  const unitSymbol = "°";
  const khmerCondition = getKhmerWeatherCondition(weather.condition.text);
  const atmosphere = getWeatherAtmosphere(weather.condition.code, weather.is_day);

  // Apple Weather subtle atmosphere tint
  const atmosphereGradients = {
    sunny: "from-amber-500/14 via-orange-500/6 to-transparent",
    cloudy: "from-sky-500/12 via-slate-500/6 to-transparent",
    rainy: "from-cyan-600/20 via-blue-600/8 to-transparent",
    thunder: "from-purple-600/22 via-indigo-600/8 to-transparent",
    night: "from-indigo-600/18 via-blue-950/15 to-transparent",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl apple-glass p-4 sm:p-6 lg:p-8 shadow-2xl transition-colors duration-300 bg-gradient-to-br",
        atmosphereGradients[atmosphere]
      )}
    >
      {/* Ambient specular highlight reflection */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Province Identification & Condition */}
        <div className="space-y-2.5 sm:space-y-3.5">
          {/* Region Tag & Timestamp */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-primary/15 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-primary border border-primary/20 shadow-2xs">
              <MapPin className="size-3 shrink-0" />
              <span className="font-khmer">{province.regionLabelKh}</span>
              <span className="opacity-40">·</span>
              <span>{province.regionLabelEn}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
              <Clock className="size-3 opacity-70 shrink-0" />
              <span>
                {weather.last_updated?.split(" ")[1] || "ថ្មីៗ"}
              </span>
            </span>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="size-5 sm:size-6 rounded-full bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center apple-press cursor-pointer border border-border/40 shrink-0"
                title="Refresh weather"
              >
                <RefreshCw className={cn("size-2.5 sm:size-3", isLoading && "animate-spin text-primary")} />
              </button>
            )}
          </div>

          {/* Bilingual Province Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-0.5">
              <span className="font-khmer">{province.nameKh}</span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-normal text-muted-foreground/80 tracking-tight">
                · {province.nameEn}
              </span>
            </h2>
            <p className="text-[11px] sm:text-sm text-muted-foreground/90 mt-0.5 sm:mt-1 font-medium truncate">
              <span className="font-khmer">{province.capitalKh}</span> · {province.capitalEn}
            </p>
          </div>

          {/* Condition pill & bilingual description */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pt-0.5 sm:pt-1">
            {weather.condition.icon && (
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-md border border-white/20 p-1 backdrop-blur-md">
                <img
                  src={`https:${weather.condition.icon}`}
                  alt={weather.condition.text}
                  className="size-9 sm:size-12 object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-foreground tracking-tight font-khmer truncate">
                {khmerCondition}
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {weather.condition.text}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Temperature & Feels Like */}
        <div className="flex flex-row items-end justify-between sm:justify-start lg:flex-col lg:items-end gap-2 border-t lg:border-t-0 pt-3 sm:pt-4 lg:pt-0 border-border/50">
          <div className="flex items-start">
            <span className="text-6xl sm:text-7xl lg:text-9xl font-light tracking-tighter text-foreground tabular-nums leading-none">
              {temp}
            </span>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-primary/90 ml-0.5">
              {unitSymbol}
            </span>
          </div>

          <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Thermometer className="size-3.5 text-amber-500 shrink-0" />
              <span>
                មានអារម្មណ៍ដូច{" "}
                <strong className="text-foreground font-semibold">
                  {feelsLike}°
                </strong>
              </span>
            </div>

            {weather.heatindex_c !== null && (
              <div className="text-[10px] sm:text-[11px] text-muted-foreground/75 font-medium">
                កម្តៅ Heat Index: {Math.round(weather.heatindex_c)}°C
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
