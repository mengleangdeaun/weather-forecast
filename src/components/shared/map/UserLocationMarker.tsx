import { MapMarker, MarkerContent, MarkerLabel } from "@/components/ui/map";
import { cn } from "@/lib/utils";

interface UserLocationMarkerProps {
  coordinates: [number, number] | null;
  label?: string;
  className?: string;
}

export const UserLocationMarker = ({
  coordinates,
  label = "ទីតាំងរបស់អ្នក · Your Location",
  className,
}: UserLocationMarkerProps) => {
  if (!coordinates) return null;

  return (
    <MapMarker longitude={coordinates[0]} latitude={coordinates[1]}>
      <MarkerContent className={cn("z-50 pointer-events-none", className)}>
        <div className="relative flex items-center justify-center">
          {/* Sonar rings */}
          <div className="absolute size-8 rounded-full bg-blue-500/25 animate-ping" />
          <div className="absolute size-5 rounded-full bg-blue-500/40 animate-pulse" />

          {/* Core GPS point */}
          <div className="relative size-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="size-1.5 rounded-full bg-white" />
          </div>
        </div>

        {label && (
          <MarkerLabel
            position="top"
            className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-medium shadow-md border border-white/20 whitespace-nowrap"
          >
            {label}
          </MarkerLabel>
        )}
      </MarkerContent>
    </MapMarker>
  );
};
