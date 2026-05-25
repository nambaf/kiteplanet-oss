// posizioni delle stazioni NDBC referenziate dagli spot; aggiungere una boa qui per ogni nuovo refs.ndbcBuoyId
export interface NdbcStation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: string;
}

export const NDBC_STATIONS: NdbcStation[] = [
  { id: "51211", lat: 21.297, lng: -157.959, name: "Pearl Harbor Entrance, HI", type: "Waverider Buoy" },
  { id: "51201", lat: 21.671, lng: -158.118, name: "Waimea Bay, HI", type: "Waverider Buoy" },
  { id: "41043", lat: 21.090, lng: -64.864, name: "NE Puerto Rico", type: "3-meter foam buoy" },
  { id: "42058", lat: 14.114, lng: -75.949, name: "Central Caribbean", type: "3-meter foam buoy" },
  { id: "41025", lat: 35.026, lng: -75.380, name: "Diamond Shoals, NC", type: "3-meter foam buoy" },
];
