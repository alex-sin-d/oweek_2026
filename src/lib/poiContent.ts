import poiContentData from "@/data/poi-content.json";

export interface PoiContent {
  subtitle?: string | null;
  role_label: string;
  why_it_matters: string;
  quick_info_chips: string[];
  best_for: string[];
}

const contentMap = poiContentData as Record<string, PoiContent>;

export function getPoiContent(poiId: string): PoiContent | null {
  return contentMap[poiId] ?? null;
}
