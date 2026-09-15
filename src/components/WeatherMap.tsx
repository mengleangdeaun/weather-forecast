import { useEffect, useRef, useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
  type MapLayerType,
} from "@/components/ui/map";
import { CAMBODIA_PROVINCES, type Province } from "@/lib/provinces";
import type { WeatherData } from "@/lib/weather-api";
import { UserLocationMarker } from "@/components/shared/map/UserLocationMarker";
import { cn } from "@/lib/utils";
import { Droplets, Wind } from "lucide-react";

interface WeatherMapProps {
  activeProvince: Province;
  onSelectProvince: (province: Province) => void;
  weatherMap: Record<string, WeatherData>;
  userLocation: [number, number] | null;
  theme?: "light" | "dark";
  className?: string;
  onDetectLocation?: () => void;
}

// Inner helper to fly to selected province
function MapCameraController({
  activeProvince,
}: {
  activeProvince: Province;
}) {
  const { map, isLoaded } = useMap();
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;
    if (prevIdRef.current === activeProvince.id) return;
    prevIdRef.current = activeProvince.id;

    map.flyTo({
      center: activeProvince.coordinates,
      zoom: 8.5,
      essential: true,
      duration: 1200,
    });
  }, [map, isLoaded, activeProvince]);

  return null;
}

export function WeatherMap({
  activeProvince,
  onSelectProvince,
  weatherMap,
  userLocation,
  theme,
  className,
  onDetectLocation,
}: WeatherMapProps) {
  const [mapLayer, setMapLayer] = useState<MapLayerType>("roadmap");

  // Cambodia center coordinates and landscape default zoom
  const initialViewport = {
    center: [104.991, 12.565] as [number, number],
    zoom: 7.3,
    bearing: 0,
    pitch: 0,
  };

  return (
    <div className={cn("relative h-full w-full rounded-2xl sm:rounded-3xl border shadow-lg overflow-hidden bg-card/75 backdrop-blur-xl", className)}>
      <Map
        viewport={initialViewport}
        theme={theme}
        mapLayer={mapLayer}
        className="h-full w-full min-h-[340px] sm:min-h-[460px] lg:min-h-[580px]"
      >
        <MapCameraController activeProvince={activeProvince} />

        <MapControls
          position="top-right"
          showZoom={true}
          showLocate={true}
          showLayerToggle={true}
          currentLayer={mapLayer}
          onChangeLayer={setMapLayer}
          onLocate={() => {
            onDetectLocation?.();
          }}
        />

        {/* User location marker */}
        <UserLocationMarker coordinates={userLocation} />

        {/* Province Markers */}
        {CAMBODIA_PROVINCES.map((prov) => {
          const isActive = prov.id === activeProvince.id;
          const weather = weatherMap[prov.queryParam.toLowerCase()] || (isActive ? weatherMap[activeProvince.queryParam.toLowerCase()] : null);
          const temp = weather
            ? `${Math.round(weather.temp_c)}°C`
            : null;

          return (
            <MapMarker
              key={prov.id}
              longitude={prov.coordinates[0]}
              latitude={prov.coordinates[1]}
              onClick={() => onSelectProvince(prov)}
            >
              <MarkerContent>
                <div
                  className={cn(
                    "group relative flex flex-col items-center cursor-pointer transition-all duration-300",
                    isActive ? "scale-115 z-30" : "scale-90 hover:scale-105 z-10 opacity-90 hover:opacity-100"
                  )}
                >
                  {/* Pin Capsule */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-md text-xs transition-all apple-press",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20 shadow-lg scale-105 font-semibold"
                        : "apple-glass text-foreground hover:border-primary/50"
                    )}
                  >
                    {weather?.condition.icon ? (
                      <img
                        src={`https:${weather.condition.icon}`}
                        alt={weather.condition.text}
                        className="size-4 object-contain"
                      />
                    ) : (
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          isActive ? "bg-primary-foreground animate-pulse" : "bg-primary/70"
                        )}
                      />
                    )}

                    <span className="font-semibold tracking-tight text-[11px] font-khmer">
                      {prov.nameKh}
                    </span>

                    {temp && (
                      <span
                        className={cn(
                          "text-[10px] px-1 rounded font-mono font-medium",
                          isActive ? "bg-primary-foreground/25 text-white" : "text-muted-foreground"
                        )}
                      >
                        {temp}
                      </span>
                    )}
                  </div>

                  {/* Pin arrow point */}
                  <div
                    className={cn(
                      "w-2 h-1.5 border-t-[6px] border-l-[4px] border-r-[4px] border-b-0 border-l-transparent border-r-transparent -mt-[1px]",
                      isActive ? "border-t-primary" : "border-t-border"
                    )}
                  />
                </div>
              </MarkerContent>

              {/* Rich popup for the active marker */}
              {isActive && weather && (
                <MarkerPopup open={true} className="w-52 sm:w-56 p-2.5 sm:p-3 max-w-[calc(100vw-40px)]">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <div>
                        <div className="font-bold text-sm leading-snug py-0.5 text-foreground font-khmer">
                          {prov.nameKh}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {prov.nameEn}
                        </div>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {temp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {weather.condition.icon && (
                        <img
                          src={`https:${weather.condition.icon}`}
                          alt={weather.condition.text}
                          className="size-6 sm:size-7"
                        />
                      )}
                      <div>
                        <div className="font-medium text-foreground text-[11px] font-khmer">
                          {weather.condition.text}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          មានអារម្មណ៍ដូច {Math.round(weather.feelslike_c)}°C
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-muted-foreground border-t">
                      <div className="flex items-center gap-1">
                        <Droplets className="size-3 text-sky-500 shrink-0" />
                        <span>សំណើម {weather.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="size-3 text-teal-500 shrink-0" />
                        <span>ខ្យល់ {weather.wind_kph}km/h</span>
                      </div>
                    </div>
                  </div>
                </MarkerPopup>
              )}
            </MapMarker>
          );
        })}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none max-w-[calc(100%-80px)]">
        <div className="apple-glass rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] text-muted-foreground shadow-xs flex items-center gap-1.5 truncate">
          <div className="size-1.5 rounded-full bg-primary shrink-0" />
          <span className="truncate">ជ្រើសរើសខេត្ត · Click province pin</span>
        </div>
      </div>
    </div>
  );
}
