// src/config/features.ts
//
// All feature flags are read from environment variables at BUILD TIME.
// Vite bakes these in as plain true/false — disabled branches get
// tree-shaken out of the production bundle automatically.
//
// To add a new flag:
//   1. Add VITE_MY_FLAG to the relevant .env files
//   2. Add a line here
//   3. Use `features.myFlag` in your components

export const features = {
  // -------------------------------------------------------------------------
  // Write / edit features
  // -------------------------------------------------------------------------

  /** Show Add / Edit / Delete buttons and forms */
  canEdit: import.meta.env.VITE_CAN_EDIT === 'true',

  /** Show the Import button in the header */
  canImport: import.meta.env.VITE_CAN_IMPORT === 'true',

  /** Show the Export button in the header */
  canExport: import.meta.env.VITE_CAN_EXPORT === 'true',

  /** Show the Exercise Lists management (create/edit/delete lists) */
  canManageLists: import.meta.env.VITE_CAN_MANAGE_LISTS === 'true',

  canPrint: import.meta.env.VITE_CAN_PRINT === 'true',

  // -------------------------------------------------------------------------
  // Media features
  // -------------------------------------------------------------------------

  /** Show video player in exercise detail */
  showVideos: import.meta.env.VITE_SHOW_VIDEOS === 'true',

  /** Show exercise images and thumbnails */
  showImages: import.meta.env.VITE_SHOW_IMAGES === 'true',

  /** Show muscle diagram SVG overlay */
  showMuscleDiagram: import.meta.env.VITE_SHOW_MUSCLE_DIAGRAM === 'true',

  // -------------------------------------------------------------------------
  // UI / navigation features
  // -------------------------------------------------------------------------

  /** Show the Table view option */
  showTableView: import.meta.env.VITE_SHOW_TABLE_VIEW === 'true',

  /** Show the Lists view option */
  showListsView: import.meta.env.VITE_SHOW_LISTS_VIEW === 'true',

  /** Show the DefaultDataBanner ("you are viewing sample data") */
  showDefaultDataBanner: import.meta.env.VITE_SHOW_DEFAULT_DATA_BANNER === 'true',

} as const;

// Convenience: true when ALL write features are off
export const isReadOnly = !features.canEdit && !features.canImport;
