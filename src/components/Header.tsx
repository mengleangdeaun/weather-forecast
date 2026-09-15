import { useState, useEffect } from "react";
import { CloudSun, Locate, Moon, Sun, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onDetectLocation: () => void;
  isLocating: boolean;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({
  onDetectLocation,
  isLocating,
  onRefreshAll,
  isRefreshing,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Phnom Penh Time (UTC+7)
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Phnom_Penh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(now);
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full apple-glass border-b border-white/20 dark:border-white/10 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Brand & Dual Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-xs border border-primary/25 apple-press">
            <CloudSun className="size-5 sm:size-5.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 truncate">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight leading-snug py-0.5 text-foreground truncate">
                <span className="text-primary font-khmer">អាកាសធាតុកម្ពុជា</span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 font-medium truncate">
              {currentTime && (
                <>
                  <span className="font-mono tracking-tight">{currentTime}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Location button */}
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isLocating}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-all apple-press cursor-pointer",
              "border border-border/80 bg-background/60 hover:bg-accent/80 text-foreground shadow-xs",
              "size-8 sm:size-auto sm:px-3 sm:py-2.5",
              isLocating && "border-primary text-primary animate-pulse"
            )}
            title="Detect nearest Cambodia province / កំណត់ទីតាំងខ្ញុំ"
          >
            <Locate className={cn("size-3.5 shrink-0", isLocating && "animate-spin text-primary")} />
            <span className="hidden md:inline">
              {isLocating ? "កំពុងស្វែងរក..." : "ទីតាំងខ្ញុំ"}
            </span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="size-8 sm:size-9 rounded-full border border-border/80 bg-background/60 hover:bg-accent/80 text-foreground flex items-center justify-center shadow-xs apple-press cursor-pointer"
            title="Refresh current weather data"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-primary")} />
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="size-8 sm:size-9 rounded-full border border-border/80 bg-background/60 hover:bg-accent/80 text-foreground flex items-center justify-center shadow-xs apple-press cursor-pointer"
            title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="size-3.5 sm:size-4 text-amber-400" />
            ) : (
              <Moon className="size-3.5 sm:size-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
