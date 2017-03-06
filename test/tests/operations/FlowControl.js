/**
 * Flow Control tests.
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
TestRegister.addTests([
    {
        name: "Fork: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
        ],
    },
    {
        name: "Fork, Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Fork, (expect) Error, Merge",
        input: "1\n2\na\n4",
        expectedError: true,
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "To Base",
                args: [16],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Fork, Conditional Jump, Encodings",
        input: "Some data with a 1 in it\nSome data with a 2 in it",
        expectedOutput: "U29tZSBkYXRhIHdpdGggYSAxIGluIGl0\n53 6f 6d 65 20 64 61 74 61 20 77 69 74 68 20 61 20 32 20 69 6e 20 69 74\n",
        recipeConfig: [
            {"op":"Fork", "args":["\\n", "\\n", false]},
            {"op":"Conditional Jump", "args":["1", "2", "10"]},
            {"op":"To Hex", "args":["Space"]},
            {"op":"Return", "args":[]},
            {"op":"To Base64", "args":["A-Za-z0-9+/="]}
        ]
    },
    {
        name: "Conditional Jump: Skips 0",
        input: [
            "match",
            "should be changed 1",
            "should be changed 2",
        ].join("\n"),
        expectedOutput: [
            "match",
            "should be changed 1 was changed",
            "should be changed 2 was changed"
        ].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["match", 0, 0],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed 1"
                    },
                    "should be changed 1 was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed 2"
                    },
                    "should be changed 2 was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
]);
