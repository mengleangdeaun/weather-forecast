export interface Province {
  id: string;
  nameEn: string;
  nameKh: string;
  queryParam: string;
  capitalEn: string;
  capitalKh: string;
  region: "capital" | "plains" | "coastal" | "tonle_sap" | "highlands";
  regionLabelEn: string;
  regionLabelKh: string;
  coordinates: [number, number]; // [lng, lat]
}

export const CAMBODIA_REGIONS = [
  { id: "all", labelEn: "All Regions", labelKh: "គ្រប់តំបន់" },
  { id: "capital", labelEn: "Capital", labelKh: "រាជធានី" },
  { id: "plains", labelEn: "Central Plains", labelKh: "តំបន់ទំនាបកណ្ដាល" },
  { id: "tonle_sap", labelEn: "Tonle Sap Lake", labelKh: "តំបន់បឹងទន្លេសាប" },
  { id: "coastal", labelEn: "Coastal", labelKh: "តំបន់ឆ្នេរសមុទ្រ" },
  { id: "highlands", labelEn: "Plateau & Highlands", labelKh: "តំបន់ខ្ពង់រាប" },
] as const;

export const CAMBODIA_PROVINCES: Province[] = [
  {
    id: "phnom-penh",
    nameEn: "Phnom Penh",
    nameKh: "រាជធានីភ្នំពេញ",
    queryParam: "Phnom Penh",
    capitalEn: "Phnom Penh",
    capitalKh: "ភ្នំពេញ",
    region: "capital",
    regionLabelEn: "Capital",
    regionLabelKh: "រាជធានី",
    coordinates: [104.9282, 11.5564],
  },
  {
    id: "siem-reap",
    nameEn: "Siem Reap",
    nameKh: "សៀមរាប",
    queryParam: "Siem Reap",
    capitalEn: "Siem Reap",
    capitalKh: "សៀមរាប",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [103.8606, 13.3633],
  },
  {
    id: "battambang",
    nameEn: "Battambang",
    nameKh: "បាត់ដំបង",
    queryParam: "Battambang",
    capitalEn: "Battambang",
    capitalKh: "បាត់ដំបង",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [103.1982, 13.0957],
  },
  {
    id: "sihanoukville",
    nameEn: "Sihanoukville",
    nameKh: "ព្រះសីហនុ",
    queryParam: "Sihanoukville",
    capitalEn: "Preah Sihanouk",
    capitalKh: "ព្រះសីហនុ",
    region: "coastal",
    regionLabelEn: "Coastal",
    regionLabelKh: "ឆ្នេរសមុទ្រ",
    coordinates: [103.5234, 10.6275],
  },
  {
    id: "kampot",
    nameEn: "Kampot",
    nameKh: "កំពត",
    queryParam: "Kampot",
    capitalEn: "Kampot",
    capitalKh: "កំពត",
    region: "coastal",
    regionLabelEn: "Coastal",
    regionLabelKh: "ឆ្នេរសមុទ្រ",
    coordinates: [104.1815, 10.6104],
  },
  {
    id: "kep",
    nameEn: "Kep",
    nameKh: "កែប",
    queryParam: "Kep",
    capitalEn: "Kep",
    capitalKh: "កែប",
    region: "coastal",
    regionLabelEn: "Coastal",
    regionLabelKh: "ឆ្នេរសមុទ្រ",
    coordinates: [104.3167, 10.4833],
  },
  {
    id: "koh-kong",
    nameEn: "Koh Kong",
    nameKh: "កោះកុង",
    queryParam: "Koh Kong",
    capitalEn: "Khemarak Phoumin",
    capitalKh: "ខេមរភូមិន្ទ",
    region: "coastal",
    regionLabelEn: "Coastal",
    regionLabelKh: "ឆ្នេរសមុទ្រ",
    coordinates: [102.9838, 11.6153],
  },
  {
    id: "kandal",
    nameEn: "Kandal",
    nameKh: "កណ្តាល",
    queryParam: "Kandal",
    capitalEn: "Ta Khmau",
    capitalKh: "តាខ្មៅ",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [104.95, 11.4833],
  },
  {
    id: "kampong-cham",
    nameEn: "Kampong Cham",
    nameKh: "កំពង់ចាម",
    queryParam: "Kampong Cham",
    capitalEn: "Kampong Cham",
    capitalKh: "កំពង់ចាម",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [105.4635, 11.9934],
  },
  {
    id: "kampong-chhnang",
    nameEn: "Kampong Chhnang",
    nameKh: "កំពង់ឆ្នាំង",
    queryParam: "Kampong Chhnang",
    capitalEn: "Kampong Chhnang",
    capitalKh: "កំពង់ឆ្នាំង",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [104.6656, 12.25],
  },
  {
    id: "kampong-speu",
    nameEn: "Kampong Speu",
    nameKh: "កំពង់ស្ពឺ",
    queryParam: "Kampong Speu",
    capitalEn: "Chbar Mon",
    capitalKh: "ច្បារមន",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [104.5306, 11.45],
  },
  {
    id: "kampong-thom",
    nameEn: "Kampong Thom",
    nameKh: "កំពង់ធំ",
    queryParam: "Kampong Thom",
    capitalEn: "Stung Saen",
    capitalKh: "ស្ទឹងសែន",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [104.8887, 12.7111],
  },
  {
    id: "kratie",
    nameEn: "Kratie",
    nameKh: "ក្រចេះ",
    queryParam: "Kratie",
    capitalEn: "Kratie",
    capitalKh: "ក្រចេះ",
    region: "highlands",
    regionLabelEn: "Plateau & Highlands",
    regionLabelKh: "តំបន់ខ្ពង់រាប",
    coordinates: [106.0188, 12.4881],
  },
  {
    id: "mondulkiri",
    nameEn: "Mondulkiri",
    nameKh: "មណ្ឌលគិរី",
    queryParam: "Mondulkiri",
    capitalEn: "Sen Monorom",
    capitalKh: "សែនមនោរម្យ",
    region: "highlands",
    regionLabelEn: "Plateau & Highlands",
    regionLabelKh: "តំបន់ខ្ពង់រាប",
    coordinates: [107.1884, 12.4558],
  },
  {
    id: "ratanakiri",
    nameEn: "Ratanakiri",
    nameKh: "រតនគិរី",
    queryParam: "Ratanakiri",
    capitalEn: "Banlung",
    capitalKh: "បានលុង",
    region: "highlands",
    regionLabelEn: "Plateau & Highlands",
    regionLabelKh: "តំបន់ខ្ពង់រាប",
    coordinates: [106.9833, 13.7333],
  },
  {
    id: "preah-vihear",
    nameEn: "Preah Vihear",
    nameKh: "ព្រះវិហារ",
    queryParam: "Preah Vihear",
    capitalEn: "Tbeng Meanchey",
    capitalKh: "ត្បែងមានជ័យ",
    region: "highlands",
    regionLabelEn: "Plateau & Highlands",
    regionLabelKh: "តំបន់ខ្ពង់រាប",
    coordinates: [104.9804, 13.8073],
  },
  {
    id: "oddar-meanchey",
    nameEn: "Oddar Meanchey",
    nameKh: "ឧត្តរមានជ័យ",
    queryParam: "Oddar Meanchey",
    capitalEn: "Samraong",
    capitalKh: "សំរោង",
    region: "highlands",
    regionLabelEn: "Plateau & Highlands",
    regionLabelKh: "តំបន់ខ្ពង់រាប",
    coordinates: [103.5167, 14.1833],
  },
  {
    id: "banteay-meanchey",
    nameEn: "Banteay Meanchey",
    nameKh: "បន្ទាយមានជ័យ",
    queryParam: "Banteay Meanchey",
    capitalEn: "Serei Saophoan",
    capitalKh: "សិរីសោភ័ណ",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [102.9896, 13.5859],
  },
  {
    id: "pursat",
    nameEn: "Pursat",
    nameKh: "ពោធិ៍សាត់",
    queryParam: "Pursat",
    capitalEn: "Pursat",
    capitalKh: "ពោធិ៍សាត់",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [103.9192, 12.5388],
  },
  {
    id: "prey-veng",
    nameEn: "Prey Veng",
    nameKh: "ព្រៃវែង",
    queryParam: "Prey Veng",
    capitalEn: "Prey Veng",
    capitalKh: "ព្រៃវែង",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [105.3253, 11.4868],
  },
  {
    id: "svay-rieng",
    nameEn: "Svay Rieng",
    nameKh: "ស្វាយរៀង",
    queryParam: "Svay Rieng",
    capitalEn: "Svay Rieng",
    capitalKh: "ស្វាយរៀង",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [105.7993, 11.0879],
  },
  {
    id: "takeo",
    nameEn: "Takeo",
    nameKh: "តាកែវ",
    queryParam: "Takeo",
    capitalEn: "Doun Kaev",
    capitalKh: "ដូនកែវ",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [104.7988, 10.9908],
  },
  {
    id: "pailin",
    nameEn: "Pailin",
    nameKh: "ប៉ៃលិន",
    queryParam: "Pailin",
    capitalEn: "Pailin",
    capitalKh: "ប៉ៃលិន",
    region: "tonle_sap",
    regionLabelEn: "Tonle Sap",
    regionLabelKh: "បឹងទន្លេសាប",
    coordinates: [102.6093, 12.8489],
  },
  {
    id: "tboung-khmum",
    nameEn: "Tboung Khmum",
    nameKh: "ត្បូងឃ្មុំ",
    queryParam: "Tboung Khmum",
    capitalEn: "Suong",
    capitalKh: "សួង",
    region: "plains",
    regionLabelEn: "Central Plains",
    regionLabelKh: "ទំនាបកណ្ដាល",
    coordinates: [105.6578, 11.8892],
  },
  {
    id: "stung-treng",
    nameEn: "Stung Treng",
    nameKh: "ស្ទឹងត្រែង",
    queryParam: "Kratie", // Fallback to adjacent Kratie if Stung Treng MEF API is unavailable
    capitalEn: "Stung Treng",
    capitalKh: "ស្ទឹងត្រែង",
    region: "highlands",
    regionLabelEn: "Plateau & Highlands",
    regionLabelKh: "តំបន់ខ្ពង់រាប",
    coordinates: [105.9683, 13.5259],
  },
];

/**
 * Calculates distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest Cambodian province to given GPS coordinates.
 */
export function findNearestProvince(lat: number, lng: number): {
  province: Province;
  distanceKm: number;
} {
  let nearest = CAMBODIA_PROVINCES[0];
  let minDistance = calculateDistanceKm(
    lat,
    lng,
    nearest.coordinates[1],
    nearest.coordinates[0]
  );

  for (const province of CAMBODIA_PROVINCES) {
    const dist = calculateDistanceKm(
      lat,
      lng,
      province.coordinates[1],
      province.coordinates[0]
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = province;
    }
  }

  return { province: nearest, distanceKm: Math.round(minDistance) };
}
