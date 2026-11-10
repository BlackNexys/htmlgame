/** Static background modules; electronic equipment here adds no gameplay mechanics. */
export const architectureNames=['stationEntrance','inhabitedBalcony','stationCanopy','retainingPier','bridgeDeck','bridgeArch','freightCage','maintenanceStairs','registryShelves','registryCounter','registryGallery','archiveMachinery'] as const;
export type ArchitectureName=typeof architectureNames[number];
