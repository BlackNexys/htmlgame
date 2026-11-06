/** Companion combat poses; source windows exclude adjacent rows' flame tips. */
export const characterAimAtlas = {
    image: 'character-aim-v1.png', width: 1254, height: 1254, cell: 209, size: 80,
    rows: [
        {x: [108,107,106,103,102,101], y: [196,196,196,196,197,196], sourceY: 0, height: 209},
        {x: [111,107,103,103,103,102], y: [187,187,187,187,187,187], sourceY: 209, height: 200},
        {x: [118,118,116,115,113,111], y: [192,192,192,192,192,192], sourceY: 418, height: 209},
        {x: [119,119,117,116,115,114], y: [193,192,192,192,192,192], sourceY: 627, height: 209},
        {x: [109,107,104,102,100,99], y: [172,166,165,168,171,171], sourceY: 836, height: 174},
        {x: [109,106,104,101,100,98], y: [195,192,183,183,182,181], sourceY: 1011, height: 243},
    ],
} as const;
