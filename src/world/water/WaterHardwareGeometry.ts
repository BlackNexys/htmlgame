import type {Rect} from '../../interfaces/Geometry';

/** Measured landmarks in the cropped drainage-v7 artwork, in source pixels.
 * These describe the hardware openings, not the transparent image bounds.
 * Keep renderer placement and network sockets on this same transform.
 */
export const waterHardware = {
    outlet: {width: 309, height: 368, mouth: {x: 247, y: 346}},
    basin: {width: 368, height: 159, waterline: 59,
        surface: {x: 46, width: 272, height: 16}, spill: {x: 281, y: 99}},
} as const;

export function outletArtwork(mouth: {x: number; y: number}): Rect {
    const art = waterHardware.outlet, width = 56, height = 64;
    return {x: mouth.x - art.mouth.x / art.width * width,
        y: mouth.y - art.mouth.y / art.height * height, width, height};
}

/** A basin's authored y is its waterline; y2 is the bottom of its housing. */
export function basinGeometry(body: Rect) {
    const art = waterHardware.basin;
    const sx = body.width / art.width, sy = body.height / (art.height - art.waterline);
    const artwork = {x: body.x, y: body.y - art.waterline * sy,
        width: body.width, height: art.height * sy};
    return {artwork,
        surface: {x: body.x + art.surface.x * sx, y: body.y,
            width: art.surface.width * sx, height: art.surface.height * sy},
        spill: {x: body.x + art.spill.x * sx,
            y: body.y + (art.spill.y - art.waterline) * sy}};
}
