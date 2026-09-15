"use client";

import * as MapLibreGL from "maplibre-gl";
import type { PopupOptions, MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MapContext, useMap, type MapViewport } from "./map-context";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// Initialize RTL plugin for complex scripts like Khmer
if (typeof window !== "undefined" && !MapLibreGL.getRTLTextPluginStatus()) {
  try {
    (MapLibreGL as unknown as { setRTLTextPlugin: (url: string, callback?: unknown, lazy?: boolean) => void }).setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      null,
      false
    );
  } catch (e) {
    console.warn("RTL text plugin init:", e);
  }
}

export type MapLayerType = "roadmap" | "satellite" | "terrain";

export function createGoogleKhmerStyle(layer: MapLayerType, isDark: boolean): MapLibreGL.StyleSpecification {
  let tilesUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=km";
  
  if (layer === "satellite") {
    // Hybrid satellite with Khmer place labels
    tilesUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=km";
  } else if (layer === "terrain") {
    // Terrain with elevation shading & Khmer place labels
    tilesUrl = "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=km";
  }

  const paintProps =
    isDark && layer === "roadmap"
      ? {
          "raster-brightness-max": 0.85,
          "raster-brightness-min": 0.08,
          "raster-contrast": 0.15,
          "raster-hue-rotate": 180,
          "raster-saturation": -0.65,
        }
      : {};

  return {
    version: 8,
    sources: {
      "google-khmer-tiles": {
        type: "raster",
        tiles: [tilesUrl],
        tileSize: 256,
        attribution: "&copy; Google Maps",
      },
    },
    layers: [
      {
        id: "google-khmer-tiles",
        type: "raster",
        source: "google-khmer-tiles",
        minzoom: 0,
        maxzoom: 22,
        paint: paintProps,
      },
    ],
  };
}

export type Theme = "light" | "dark";

function getDocumentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  return "light";
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(() =>
    getDocumentTheme()
  );

  useEffect(() => {
    if (themeProp) return;

    const observer = new MutationObserver(() => {
      setDetectedTheme(getDocumentTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

type MapStyleOption = string | MapLibreGL.StyleSpecification;
type MapRef = MapLibreGL.Map;

export type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  mapLayer?: MapLayerType;
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
  onClick?: (e: MapLibreGL.MapMouseEvent) => void;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

function DefaultLoader() {
  return (
    <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="bg-primary size-2 animate-pulse rounded-full" />
        <span className="bg-primary size-2 animate-pulse rounded-full [animation-delay:150ms]" />
        <span className="bg-primary size-2 animate-pulse rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

export const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    children,
    className,
    theme: themeProp,
    mapLayer = "roadmap",
    styles,
    viewport,
    onViewportChange,
    loading = false,
    onClick,
    ...props
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const internalUpdateRef = useRef(false);
  const currentKeyRef = useRef<string>("");
  const resolvedTheme = useResolvedTheme(themeProp);

  const isControlled = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  // Compute active style
  const activeStyle = useMemo<MapStyleOption>(() => {
    if (styles) {
      return resolvedTheme === "dark" ? (styles.dark || styles.light!) : (styles.light || styles.dark!);
    }
    return createGoogleKhmerStyle(mapLayer, resolvedTheme === "dark");
  }, [styles, mapLayer, resolvedTheme]);

  const activeStyleKey = `${mapLayer}-${resolvedTheme}`;

  // Initialize the map
  useEffect(() => {
    if (!containerRef.current) return;

    currentKeyRef.current = activeStyleKey;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: activeStyle,
      renderWorldCopies: false,
      attributionControl: {
        compact: true,
      },
      ...props,
      ...viewport,
    });

    map.on("load", () => {
      setIsLoaded(true);
      setMapInstance(map);
      map.resize();
      if (onViewportChangeRef.current) {
        onViewportChangeRef.current(getViewport(map));
      }
    });

    const handleMove = () => {
      if (internalUpdateRef.current) return;
      if (onViewportChangeRef.current) {
        onViewportChangeRef.current(getViewport(map));
      }
    };

    map.on("move", handleMove);

    if (onClick) {
      map.on("click", onClick);
    }

    // ResizeObserver to handle container size changes smoothly
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    };
  }, []);

  // Update style when theme or mapLayer changes
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;
    if (currentKeyRef.current === activeStyleKey) return;

    currentKeyRef.current = activeStyleKey;
    mapInstance.setStyle(activeStyle);
  }, [activeStyleKey, activeStyle, mapInstance, isLoaded]);

  // Controlled viewport updates
  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return;

    internalUpdateRef.current = true;
    if (viewport.center) {
      mapInstance.setCenter(viewport.center);
    }
    if (viewport.zoom !== undefined) {
      mapInstance.setZoom(viewport.zoom);
    }
    if (viewport.bearing !== undefined) {
      mapInstance.setBearing(viewport.bearing);
    }
    if (viewport.pitch !== undefined) {
      mapInstance.setPitch(viewport.pitch);
    }
    internalUpdateRef.current = false;
  }, [viewport, mapInstance, isControlled]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      <MapContext.Provider value={{ map: mapInstance, isLoaded }}>
        {children}
        {loading && <DefaultLoader />}
      </MapContext.Provider>
    </div>
  );
});

// Marker Context
type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};
const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("useMarkerContext must be used within a MapMarker");
  }
  return context;
}

export type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children?: ReactNode;
  onClick?: (e: MouseEvent) => void;
  draggable?: boolean;
} & Omit<MarkerOptions, "element">;

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const callbacksRef = useRef({ onClick });
  callbacksRef.current = { onClick };

  const marker = useMemo(() => {
    const el = document.createElement("div");
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: el,
      draggable,
    }).setLngLat([longitude, latitude]);

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      callbacksRef.current.onClick?.(e);
    };
    el.addEventListener("click", handleClick);

    return markerInstance;
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  useEffect(() => {
    marker.setLngLat([longitude, latitude]);
  }, [longitude, latitude, marker]);

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
    </MarkerContext.Provider>
  );
}

export type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

export function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("relative cursor-pointer transition-transform", className)}>
      {children}
    </div>,
    marker.getElement()
  );
}

export type MarkerLabelProps = {
  children: ReactNode;
  className?: string;
  position?: "top" | "bottom";
};

export function MarkerLabel({
  children,
  className,
  position = "top",
}: MarkerLabelProps) {
  const positionClasses = {
    top: "bottom-full mb-1.5",
    bottom: "top-full mt-1.5",
  };

  return (
    <div
      className={cn(
        "absolute start-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none",
        "text-foreground text-[11px] font-medium",
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
}

export type MarkerPopupProps = {
  children: ReactNode;
  open?: boolean;
  onClose?: () => void;
  className?: string;
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

export function MarkerPopup({
  children,
  className,
  closeButton = false,
  onClose,
  open,
  ...popupOptions
}: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);

  const popup = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 14,
      ...popupOptions,
      closeButton: false,
      className: "weather-map-popup",
    })
      .setMaxWidth("none")
      .setDOMContent(container);
  }, []);

  useEffect(() => {
    if (!map) return;
    popup.on("close", () => onClose?.());
    marker.setPopup(popup);

    return () => {
      marker.setPopup(null);
    };
  }, [map, marker, popup, onClose]);

  useEffect(() => {
    if (!map || open === undefined) return;
    if (open) {
      if (!popup.isOpen()) marker.togglePopup();
    } else {
      if (popup.isOpen()) popup.remove();
    }
  }, [map, open, popup, marker]);

  return createPortal(
    <div
      className={cn(
        "bg-popover text-popover-foreground relative rounded-xl border p-3 shadow-2xl backdrop-blur-md",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={() => popup.remove()}
          className="absolute top-1 right-1 size-5 rounded hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
        >
          <X className="size-3" />
        </button>
      )}
      {children}
    </div>,
    container
  );
}

export type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showLocate?: boolean;
  showRefresh?: boolean;
  showLayerToggle?: boolean;
  currentLayer?: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
  isRefreshing?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
  onRefresh?: () => void;
};

const positionClasses = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

export function MapControls({
  position = "top-right",
  showZoom = true,
  showLocate = true,
  showRefresh = false,
  showLayerToggle = false,
  currentLayer = "roadmap",
  onChangeLayer,
  isRefreshing = false,
  className,
  onLocate,
  onRefresh,
}: MapControlsProps) {
  const { map } = useMap();
  const [isLocating, setIsLocating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { longitude, latitude } = pos.coords;
        map?.flyTo({ center: [longitude, latitude], zoom: 10 });
        onLocate?.({ longitude, latitude });
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-1.5 p-1 rounded-xl bg-card/90 backdrop-blur-md border shadow-lg",
        positionClasses[position],
        className
      )}
    >
      {showZoom && (
        <>
          <button
            type="button"
            onClick={handleZoomIn}
            className="size-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Zoom in"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="size-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Zoom out"
          >
            <Minus className="size-4" />
          </button>
        </>
      )}

      {showLocate && (
        <button
          type="button"
          onClick={handleLocate}
          className={cn(
            "size-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground transition-colors cursor-pointer",
            isLocating && "animate-spin text-primary"
          )}
          title="Detect My Location"
        >
          <Locate className="size-4" />
        </button>
      )}

      {showLayerToggle && onChangeLayer && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="size-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Switch Map Style / ប្តូរប្រភេទផែនទី"
          >
            <Layers className="size-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-full top-0 mr-2 flex flex-col gap-1 p-1.5 rounded-xl bg-card/95 backdrop-blur-xl border shadow-xl min-w-36 z-20 text-xs">
              <button
                type="button"
                onClick={() => {
                  onChangeLayer("roadmap");
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between",
                  currentLayer === "roadmap"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-accent text-foreground"
                )}
              >
                <span>ផ្លូវ · Standard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeLayer("satellite");
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between",
                  currentLayer === "satellite"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-accent text-foreground"
                )}
              >
                <span>ផ្កាយរណប · Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeLayer("terrain");
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between",
                  currentLayer === "terrain"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-accent text-foreground"
                )}
              >
                <span>ដី និងភ្នំ · Terrain</span>
              </button>
            </div>
          )}
        </div>
      )}

      {showRefresh && onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className={cn(
            "size-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground transition-colors cursor-pointer",
            isRefreshing && "animate-spin text-primary"
          )}
          title="Refresh Map Weather"
        >
          <RefreshCw className="size-4" />
        </button>
      )}
    </div>
  );
}

export { useMap };
