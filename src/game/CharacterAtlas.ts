/** V2 sheet from the established menu hero. Anchors compensate for generated frame drift. */
export const characterAtlas = {
    "image": "character-animations-v2.png",
    "width": 1254,
    "height": 1254,
    "cell": 209,
    "size": 80,
    "hip": -24,
    "anchors": {
        "idle": {
            "x": [
                111,
                108,
                104,
                100,
                99,
                97
            ],
            "y": [
                200,
                200,
                200,
                200,
                200,
                200
            ],
            "mirror": true
        },
        "run": {
            "x": [
                112,
                110,
                108,
                106,
                104,
                102
            ],
            "y": [
                191,
                191,
                191,
                191,
                191,
                191
            ],
            "mirror": false
        },
        "air": {
            "x": [
                105,
                105,
                107,
                108,
                106,
                104
            ],
            "y": [
                198,
                196,
                166,
                151,
                182,
                198
            ],
            "mirror": false
        },
        "attack": {
            "x": [
                109,
                109,
                105,
                103,
                101,
                101
            ],
            "y": [
                195,
                195,
                195,
                194,
                194,
                194
            ],
            "mirror": false
        },
        "hurt": {
            "x": [
                108,
                106,
                104,
                102,
                100,
                98
            ],
            "y": [
                193,
                193,
                193,
                193,
                193,
                193
            ],
            "mirror": false
        },
        "defeat": {
            "x": [
                107,
                105,
                103,
                101,
                99,
                97
            ],
            "y": [
                185,
                184,
                184,
                184,
                184,
                182
            ],
            "mirror": false
        }
    }
} as const;
