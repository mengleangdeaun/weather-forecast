import { useState, useEffect, useCallback, useRef } from "react";
import {
  CAMBODIA_PROVINCES,
  type Province,
  findNearestProvince,
} from "@/lib/provinces";
import {
  type WeatherData,
  fetchWeather,
  getLastSelectedProvinceId,
  saveLastSelectedProvinceId,
  getWeatherAtmosphere,
} from "@/lib/weather-api";
import { Header } from "@/components/Header";
import { WeatherHero } from "@/components/WeatherHero";
import { WeatherMetricsGrid } from "@/components/WeatherMetricsGrid";
import { ProvinceSelector } from "@/components/ProvinceSelector";
import { WeatherMap } from "@/components/WeatherMap";
import { LocationBanner } from "@/components/LocationBanner";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kh_weather_theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "dark"; // Default to premium dark
    }
    return "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("kh_weather_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: "light" | "dark" = theme === "dark" ? "light" : "dark";

    const applyThemeChange = () => {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setTheme(nextTheme);
      localStorage.setItem("kh_weather_theme", nextTheme);
    };

    // Use native View Transitions API for seamless whole-page dissolve
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as Document & { startViewTransition?: (cb: () => void) => void })
        .startViewTransition === "function"
    ) {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
        () => {
          applyThemeChange();
        }
      );
    } else if (typeof document !== "undefined") {
      // Fallback: synchronized whole-page transition
      document.documentElement.classList.add("theme-transitioning");
      applyThemeChange();
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 350);
    } else {
      applyThemeChange();
    }
  };


  // Active province state
  const [activeProvince, setActiveProvince] = useState<Province>(() => {
    const savedId = getLastSelectedProvinceId();
    const found = CAMBODIA_PROVINCES.find((p) => p.id === savedId);
    return found || CAMBODIA_PROVINCES[0]; // Default Phnom Penh
  });

  // Weather dictionary map: key is lowercased queryParam
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User GPS coordinates [lng, lat]
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "locating" | "success" | "error" | null
  >(null);
  const [detectedProvinceInfo, setDetectedProvinceInfo] = useState<{
    province: Province;
    distanceKm: number;
  } | null>(null);

  // Fetch weather for a single province
  const loadWeather = useCallback(
    async (prov: Province) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchWeather(prov.queryParam);
        setWeatherMap((prev) => ({
          ...prev,
          [prov.queryParam.toLowerCase()]: data,
        }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load weather data";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadWeather(activeProvince);
  }, [activeProvince, loadWeather]);

  // Handle Province Selection
  const handleSelectProvince = (province: Province) => {
    setActiveProvince(province);
    saveLastSelectedProvinceId(province.id);
  };

  // Batch preload background weather for other major provinces
  const preloadDoneRef = useRef(false);
  useEffect(() => {
    if (preloadDoneRef.current) return;
    preloadDoneRef.current = true;

    const majorProvinces = CAMBODIA_PROVINCES.filter(
      (p) => p.id !== activeProvince.id
    );

    const loadSequentially = async () => {
      // Delay slightly so primary request has priority
      await new Promise((r) => setTimeout(r, 600));

      for (const p of majorProvinces) {
        try {
          const data = await fetchWeather(p.queryParam);
          setWeatherMap((prev) => ({
            ...prev,
            [p.queryParam.toLowerCase()]: data,
          }));
          // Small throttle between background calls to be gentle to MEF API
          await new Promise((r) => setTimeout(r, 400));
        } catch {
          // Ignore background fetch errors
        }
      }
    };

    loadSequentially();
  }, []);

  // Detect user GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErrorMessage(
        "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រ Geolocation ទេ។ · Browser does not support geolocation."
      );
      return;
    }

    setLocationStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([longitude, latitude]);

        const match = findNearestProvince(latitude, longitude);
        setDetectedProvinceInfo(match);
        setLocationStatus("success");
        handleSelectProvince(match.province);
      },
      (err) => {
        setLocationStatus("error");
        setErrorMessage(
          err.message ||
            "ការទាញយកទីតាំងត្រូវបានបដិសេធ។ · Geolocation permission denied."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const currentWeather =
    weatherMap[activeProvince.queryParam.toLowerCase()] || null;

  // Determine current atmospheric class
  const atmosphereClass = currentWeather
    ? `atmosphere-${getWeatherAtmosphere(
        currentWeather.condition.code,
        currentWeather.is_day
      )}`
    : "atmosphere-cloudy";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden w-full pt-14 sm:pt-16",
        atmosphereClass
      )}
    >
      {/* Header Bar (Fixed at top) */}
      <Header
        onDetectLocation={handleDetectLocation}
        isLocating={locationStatus === "locating"}
        onRefreshAll={() => loadWeather(activeProvince)}
        isRefreshing={isLoading}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* GPS Location Status Banner */}
      <LocationBanner
        status={locationStatus}
        detectedProvince={detectedProvinceInfo?.province}
        distanceKm={detectedProvinceInfo?.distanceKm}
        errorMessage={errorMessage}
        onDismiss={() => setLocationStatus(null)}
      />

      {/* Error alert banner if any */}
      {errorMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3 w-full">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadWeather(activeProvince)}
              className="text-xs h-7 gap-1"
            >
              <RefreshCw className="size-3" />
              <span>ព្យាយាមម្តងទៀត · Retry</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
        {/* Weather Hero Card */}
        <WeatherHero
          province={activeProvince}
          weather={currentWeather}
          isLoading={isLoading}
          onRefresh={() => loadWeather(activeProvince)}
        />

        {/* Wide Landscape Interactive Map */}
        <section className="w-full space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                ផែនទីអាកាសធាតុកម្ពុជា
              </span>
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate hidden xs:inline">
                · Interactive Weather Map
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:inline">
              ចុចលើខេត្តនីមួយៗដើម្បីមើលទិន្នន័យអាកាសធាតុ · Click pins to explore
            </span>
          </div>

          <div className="w-full h-[360px] sm:h-[480px] lg:h-[600px]">
            <WeatherMap
              activeProvince={activeProvince}
              onSelectProvince={handleSelectProvince}
              weatherMap={weatherMap}
              userLocation={userLocation}
              theme={theme}
              onDetectLocation={handleDetectLocation}
            />
          </div>
        </section>

        {/* Detailed Metrics Grid */}
        <section className="space-y-2 sm:space-y-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 px-1">
            <span className="text-xs sm:text-sm font-bold text-foreground">
              លក្ខខណ្ឌបរិយាកាសលម្អិត
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium hidden xs:inline">
              · Atmospheric Conditions
            </span>
          </div>
          <WeatherMetricsGrid weather={currentWeather} />
        </section>

        {/* Full-width Province Selector below */}
        <section className="pt-2">
          <ProvinceSelector
            activeProvince={activeProvince}
            onSelectProvince={handleSelectProvince}
            weatherMap={weatherMap}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/40 backdrop-blur-md py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="text-[11px]">
            Built with Love ©{new Date().getFullYear()} Mengleang
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
