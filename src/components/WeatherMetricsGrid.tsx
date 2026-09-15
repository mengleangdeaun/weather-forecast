import type { WeatherData } from "@/lib/weather-api";
import {
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  Cloud,
  Eye,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherMetricsGridProps {
  weather: WeatherData | null;
}

export function WeatherMetricsGrid({ weather }: WeatherMetricsGridProps) {
  if (!weather) return null;

  const windSpeed = `${weather.wind_kph} km/h`;
  const gustSpeed = `${weather.gust_kph} km/h`;
  const precip = `${weather.precip_mm} mm`;
  const dewPoint = `${weather.dewpoint_c}°C`;
  const visibility = `${weather.vis_km} km`;

  const metrics = [
    {
      id: "wind",
      titleKh: "ខ្យល់",
      titleEn: "WIND",
      value: windSpeed,
      subValue: `ខ្យល់កន្ត្រាក់: ${gustSpeed}`,
      meta: `ទិស ${weather.wind_dir} (${weather.wind_degree}°)`,
      icon: Wind,
      color: "text-teal-400",
      bg: "bg-teal-500/12",
      compassAngle: weather.wind_degree,
      progress: Math.min(100, Math.round((weather.wind_kph / 60) * 100)),
    },
    {
      id: "humidity",
      titleKh: "សំណើម",
      titleEn: "HUMIDITY",
      value: `${weather.humidity}%`,
      subValue: `ទឹកសន្សើម: ${dewPoint}`,
      meta: weather.humidity > 80 ? "សំណើមខ្ពស់ · High" : "សំណើមធម្មតា · Normal",
      icon: Droplets,
      color: "text-sky-400",
      bg: "bg-sky-500/12",
      progress: weather.humidity,
    },
    {
      id: "pressure",
      titleKh: "សម្ពាធ",
      titleEn: "PRESSURE",
      value: `${weather.pressure_mb}`,
      unitLabel: "hPa",
      subValue: `${weather.pressure_in} inHg`,
      meta: weather.pressure_mb >= 1013 ? "សម្ពាធប្រក្រតី · Steady" : "សម្ពាធទាប · Low",
      icon: Gauge,
      color: "text-indigo-400",
      bg: "bg-indigo-500/12",
      progress: Math.min(100, Math.max(0, Math.round(((weather.pressure_mb - 980) / 60) * 100))),
    },
    {
      id: "precip",
      titleKh: "ទឹកភ្លៀង",
      titleEn: "PRECIPITATION",
      value: precip,
      subValue: Number(weather.precip_mm) > 0 ? "មានភ្លៀងធ្លាក់ · Rain" : "គ្មានភ្លៀងទេ · None",
      meta: "កម្រិតទឹកភ្លៀងចុងក្រោយ",
      icon: CloudRain,
      color: "text-blue-400",
      bg: "bg-blue-500/12",
      progress: Math.min(100, Math.round((Number(weather.precip_mm) / 30) * 100)),
    },
    {
      id: "cloud",
      titleKh: "ពពក",
      titleEn: "CLOUD",
      value: `${weather.cloud}%`,
      subValue: weather.cloud > 70 ? "មេឃស្រទំ · Cloudy" : weather.cloud > 30 ? "ពពកខ្លះៗ · Partly" : "មេឃស្រឡះ · Clear",
      meta: "កម្រិតគ្របដណ្តប់ពពក",
      icon: Cloud,
      color: "text-slate-300",
      bg: "bg-slate-500/12",
      progress: weather.cloud,
    },
    {
      id: "visibility",
      titleKh: "ចម្ងាយ",
      titleEn: "VISIBILITY",
      value: visibility,
      subValue: weather.vis_km >= 10 ? "ច្បាស់ល្អ · Perfect" : "មានអ័ព្ទ · Reduced",
      meta: "ចម្ងាយមើលឃើញ",
      icon: Eye,
      color: "text-emerald-400",
      bg: "bg-emerald-500/12",
      progress: Math.min(100, Math.round((weather.vis_km / 10) * 100)),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl apple-glass p-3 sm:p-4.5 shadow-sm transition-all duration-300 hover:shadow-md apple-press min-h-[135px] sm:min-h-[155px]"
          >
            {/* Header: Icon + Category Label */}
            <div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                <div className="flex items-center gap-1 truncate">
                  <Icon className={cn("size-3.5 shrink-0", item.color)} />
                  <span className="truncate">{item.titleEn}</span>
                </div>
                {item.id === "wind" && item.compassAngle !== undefined ? (
                  <Navigation
                    className="size-3 text-teal-400 shrink-0 transition-transform duration-500"
                    style={{ transform: `rotate(${item.compassAngle}deg)` }}
                  />
                ) : (
                  <span className="font-khmer normal-case font-medium text-[10px] opacity-70 shrink-0 hidden xs:inline">
                    {item.titleKh}
                  </span>
                )}
              </div>

              {/* Value readout */}
              <div className="mt-1.5 sm:mt-2.5 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {item.value}
                </span>
                {item.unitLabel && (
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">
                    {item.unitLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Apple Subtle Gauge Bar */}
            <div className="my-1.5 sm:my-2.5">
              <div className="h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(8, item.progress)}%` }}
                />
              </div>
            </div>

            {/* Footer Summary */}
            <div className="space-y-0.5 min-w-0 pt-0.5">
              <div className="text-[11px] sm:text-xs font-semibold text-foreground/90 font-khmer leading-snug py-0.5 truncate tracking-normal">
                {item.subValue}
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground/90 font-khmer leading-snug py-0.5 truncate tracking-normal">
                {item.meta}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
