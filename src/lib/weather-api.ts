export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherData {
  id: number;
  name: string;
  created_at: string;
  last_updated_epoch: number;
  last_updated: string;
  temp_c: number;
  temp_f: number;
  is_day: boolean | number;
  condition: WeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  dewpoint_c: number;
  dewpoint_f: number;
  vis_km: number;
  vis_miles: number;
  uv: number | null;
  gust_mph: number;
  gust_kph: number;
}

export interface WeatherApiResponse {
  data?: WeatherData;
  name?: string;
  errorMsg?: string;
}

const KHMER_WEATHER_TRANSLATIONS: Record<string, string> = {
  sunny: "មេឃស្រឡះល្អ",
  clear: "មេឃស្រឡះ",
  "partly cloudy": "មានពពកខ្លះៗ",
  cloudy: "មានពពកច្រើន",
  overcast: "មេឃស្រទំ",
  mist: "ចុះអ័ព្ទស្ដើង",
  fog: "ចុះអ័ព្ទក្រាស់",
  "patchy rain possible": "អាចមានភ្លៀងរាយប៉ាយ",
  "patchy light rain": "ភ្លៀងរលឹមតិចតួច",
  "light rain": "ភ្លៀងរលឹមស្រាល",
  "light rain shower": "ភ្លៀងធ្លាក់តិចតួច",
  "moderate rain at times": "ភ្លៀងបង្គួរម្ដងម្កាល",
  "moderate rain": "ភ្លៀងបង្គួរ",
  "heavy rain at times": "ភ្លៀងធ្លាក់ខ្លាំងម្ដងម្កាល",
  "heavy rain": "ភ្លៀងធ្លាក់ខ្លាំង",
  "torrential rain shower": "ភ្លៀងធ្លាក់យ៉ាងជោកជាំ",
  "thundery outbreaks possible": "អាចមានផ្គររន្ទះ",
  "patchy light rain with thunder": "ភ្លៀងស្រាលមានផ្គររន្ទះ",
  "moderate or heavy rain with thunder": "ភ្លៀងធ្លាក់ខ្លាំងមានផ្គររន្ទះ",
};

/**
 * Returns Khmer translation for weather condition text.
 */
export function getKhmerWeatherCondition(conditionText: string): string {
  const normalized = conditionText.trim().toLowerCase();
  return KHMER_WEATHER_TRANSLATIONS[normalized] || conditionText;
}

const CACHE_STORAGE_KEY = "kh_weather_cache_v1";
const LAST_PROVINCE_KEY = "kh_weather_last_province";

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

export function saveLastSelectedProvinceId(id: string): void {
  try {
    localStorage.setItem(LAST_PROVINCE_KEY, id);
  } catch (e) {
    console.warn("Unable to save to localStorage", e);
  }
}

export function getLastSelectedProvinceId(): string | null {
  try {
    return localStorage.getItem(LAST_PROVINCE_KEY);
  } catch {
    return null;
  }
}

export function getCachedWeather(provinceQuery: string): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const cache: Record<string, CacheEntry> = JSON.parse(raw);
    const entry = cache[provinceQuery.toLowerCase()];
    if (!entry) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedWeather(
  provinceQuery: string,
  data: WeatherData
): void {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    const cache: Record<string, CacheEntry> = raw ? JSON.parse(raw) : {};
    cache[provinceQuery.toLowerCase()] = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Unable to save weather cache", e);
  }
}

/**
 * Fetches real-time weather from MEF API.
 */
export async function fetchWeather(
  provinceQuery: string,
  signal?: AbortSignal
): Promise<WeatherData> {
  const url = `https://data.mef.gov.kh/api/v1/realtime-api/weather?province=${encodeURIComponent(
    provinceQuery
  )}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      signal,
    });

    if (!res.ok) {
      const errorJson = (await res.json().catch(() => null)) as WeatherApiResponse | null;
      const errorMsg =
        errorJson?.errorMsg || `Weather service error (${res.status})`;
      throw new Error(errorMsg);
    }

    const json = (await res.json()) as WeatherApiResponse;
    if (!json.data) {
      throw new Error(json.errorMsg || "No weather data returned");
    }

    // Cache successful response
    setCachedWeather(provinceQuery, json.data);
    return json.data;
  } catch (err: unknown) {
    // Check if we have cached data for offline fallback
    const cached = getCachedWeather(provinceQuery);
    if (cached) {
      return cached;
    }
    throw err;
  }
}

/**
 * Determines weather visual atmosphere theme based on condition code & daytime.
 */
export type WeatherAtmosphere = "sunny" | "cloudy" | "rainy" | "thunder" | "night";

export function getWeatherAtmosphere(
  conditionCode: number,
  isDay: boolean | number
): WeatherAtmosphere {
  const isDaytime = Boolean(isDay);

  // Thunderstorm codes
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
    return "thunder";
  }

  // Rain codes
  if (
    [
      1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246,
    ].includes(conditionCode)
  ) {
    return "rainy";
  }

  // Cloudy / Mist codes
  if ([1006, 1009, 1030, 1135, 1147].includes(conditionCode)) {
    return isDaytime ? "cloudy" : "night";
  }

  if (!isDaytime) {
    return "night";
  }

  return "sunny";
}
