export interface Image {
  id: number;
  property_id: number;
  filename: string;
  sort_order: number;
  /** Resolved URL: `/uploads/<filename>` */
  url?: string;
}
