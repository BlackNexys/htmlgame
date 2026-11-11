/** Background shells only: collision and story anchors belong to the level. */
export const buildingFamilies=['station','residential','registry','archive'] as const;
export const buildingTrimNames=buildingFamilies.flatMap(name=>['left','right','band','roof'].map(part=>name+'-'+part));
