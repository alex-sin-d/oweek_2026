import type { StaticImageData } from "next/image";
import purpleLineImage from "@/design/images/shuttle_purple_line.png";
import silverLineImage from "@/design/images/shuttle_silver_line.png";

export type ShuttleRouteId = "purple" | "silver";
export type ShuttleRouteDetailKind =
  | "pickup"
  | "street"
  | "intersection"
  | "coverage";
export type ShuttleServiceFactIcon = "pickup" | "hours" | "dropoff" | "van";

export interface ShuttleServiceFact {
  id: string;
  label: string;
  value: string;
  icon: ShuttleServiceFactIcon;
}

export interface ShuttleRouteDetailItem {
  id: string;
  label: string;
  detail?: string;
  kind: ShuttleRouteDetailKind;
}

export interface ShuttleRoute {
  id: ShuttleRouteId;
  name: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  streets: ShuttleRouteDetailItem[];
}

export const SHUTTLE_STATUS = "Running during OWeek nights";
export const SHUTTLE_PICKUP_POI_ID = "alumni_hall";
export const SHUTTLE_SUPPORT_EMAIL = "orientation@uwo.ca";

export const SHUTTLE_SERVICE_FACTS: ShuttleServiceFact[] = [
  {
    id: "pickup-location",
    label: "Pick-up Location",
    value: "Alumni Hall",
    icon: "pickup",
  },
  {
    id: "service-hours",
    label: "Service Hours",
    value: "Nightly during OWeek",
    icon: "hours",
  },
  {
    id: "drop-off",
    label: "Drop-off",
    value: "Closest intersection on route",
    icon: "dropoff",
  },
  {
    id: "driverseat",
    label: "DriverSeat vans",
    value: "Available outside mapped areas",
    icon: "van",
  },
];

export const SHUTTLE_IMPORTANT_NOTES = [
  "Tell the driver where you live",
  "Drop-off is at the nearest highlighted intersection",
  "DriverSeat vans help students outside mapped areas",
] as const;

export const SHUTTLE_ROUTE_ORDER: ShuttleRouteId[] = ["purple", "silver"];

export const SHUTTLE_ROUTES: Record<ShuttleRouteId, ShuttleRoute> = {
  purple: {
    id: "purple",
    name: "Purple Line",
    description: "Covers west/south campus-adjacent areas",
    image: purpleLineImage,
    imageAlt:
      "Purple Line shuttle route map showing Alumni Hall pickup and west and south coverage streets.",
    streets: [
      {
        id: "purple-pickup",
        label: "Alumni Hall / Alumni Circle",
        detail: "Pick-up location",
        kind: "pickup",
      },
      {
        id: "purple-w",
        label: "The W / Sherwood Forest Mall",
        kind: "coverage",
      },
      {
        id: "purple-sarnia",
        label: "Sarnia Rd",
        kind: "street",
      },
      {
        id: "purple-windermere",
        label: "Windermere Rd",
        kind: "street",
      },
      {
        id: "purple-broughdale",
        label: "Broughdale Ave",
        kind: "street",
      },
      {
        id: "purple-huron-regent-victoria",
        label: "Huron St / Regent St / Victoria St",
        kind: "intersection",
      },
      {
        id: "purple-richmond-oxford",
        label: "Richmond St north of Oxford",
        kind: "intersection",
      },
      {
        id: "purple-oxford",
        label: "Oxford St",
        kind: "street",
      },
      {
        id: "purple-proudfoot-beaverbrook",
        label: "Proudfoot Ln / Beaverbrook Ave",
        kind: "intersection",
      },
      {
        id: "purple-cherryhill-woodward",
        label: "Cherryhill Pl / Woodward Ave",
        kind: "intersection",
      },
      {
        id: "purple-riverside-western",
        label: "Riverside Dr / Western Rd",
        kind: "intersection",
      },
    ],
  },
  silver: {
    id: "silver",
    name: "Silver Line",
    description: "Covers north/east residential corridors and the Richmond route spine",
    image: silverLineImage,
    imageAlt:
      "Silver Line shuttle route map showing Alumni Hall pickup and north and east residential coverage streets.",
    streets: [
      {
        id: "silver-pickup",
        label: "Alumni Hall / Alumni Circle",
        detail: "Pick-up location",
        kind: "pickup",
      },
      {
        id: "silver-masonville",
        label: "Masonville Place",
        kind: "coverage",
      },
      {
        id: "silver-epworth-kings",
        label: "Epworth St / King's",
        kind: "intersection",
      },
      {
        id: "silver-huron",
        label: "Huron St",
        kind: "street",
      },
      {
        id: "silver-richmond-oxford",
        label: "Richmond St north of Oxford",
        kind: "intersection",
      },
      {
        id: "silver-richmond-pall-mall",
        label: "Richmond St north of Pall Mall",
        kind: "intersection",
      },
      {
        id: "silver-richmond-hyman",
        label: "Richmond St south of Hyman",
        kind: "intersection",
      },
      {
        id: "silver-richmond-kent",
        label: "Richmond St north of Kent",
        kind: "intersection",
      },
      {
        id: "silver-richmond-queens",
        label: "Richmond St north of Queens",
        kind: "intersection",
      },
      {
        id: "silver-richmond-king",
        label: "Richmond St south of King",
        kind: "intersection",
      },
      {
        id: "silver-wharncliffe-riverside-western",
        label: "Wharncliffe Rd / Riverside Dr / Western Rd",
        kind: "intersection",
      },
    ],
  },
};
