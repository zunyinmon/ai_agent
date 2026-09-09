export interface Location {
  id: number;
  name: string;
  /** Decimal degrees — used as default map center for this city */
  latitude: number;
  /** Decimal degrees — used as default map center for this city */
  longitude: number;
}
