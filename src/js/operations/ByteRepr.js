/* globals app */

/**
 * Byte representation operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var ByteRepr = {

    /**
     * @constant
     * @default
     */
    DELIM_OPTIONS: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF"],
    /**
     * @constant
     * @default
     */
    HEX_DELIM_OPTIONS: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "0x", "\\x", "None"],
    /**
     * @constant
     * @default
     */
    BIN_DELIM_OPTIONS: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "None"],

    /**
     * To Hex operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToHex: function(input, args) {
        var delim = Utils.charRep[args[0] || "Space"];
        return Utils.toHex(input, delim, 2);
    },


    /**
     * From Hex operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFromHex: function(input, args) {
        var delim = args[0] || "Space";
        return Utils.fromHex(input, delim, 2);
    },


    /**
     * @constant
     * @default
     */
    CHARCODE_BASE: 16,

    /**
     * To Charcode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToCharcode: function(input, args) {
        var delim = Utils.charRep[args[0] || "Space"],
            base = args[1],
            output = "",
            padding = 2,
            ordinal;

        if (base < 2 || base > 36) {
            throw "Error: Base argument must be between 2 and 36";
        }

        for (var i = 0; i < input.length; i++) {
            ordinal = Utils.ord(input[i]);

            if (base === 16) {
                if (ordinal < 256) padding = 2;
                else if (ordinal < 65536) padding = 4;
                else if (ordinal < 16777216) padding = 6;
                else if (ordinal < 4294967296) padding = 8;
                else padding = 2;

                if (padding > 2) app.options.attemptHighlight = false;

                output += Utils.hex(ordinal, padding) + delim;
            } else {
                app.options.attemptHighlight = false;
                output += ordinal.toString(base) + delim;
            }
        }

        return output.slice(0, -delim.length);
    },


    /**
     * From Charcode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFromCharcode: function(input, args) {
        var delim = Utils.charRep[args[0] || "Space"],
            base = args[1],
            bites = input.split(delim),
            i = 0;

        if (base < 2 || base > 36) {
            throw "Error: Base argument must be between 2 and 36";
        }

        if (base !== 16) {
            app.options.attemptHighlight = false;
        }

        // Split into groups of 2 if the whole string is concatenated and
        // too long to be a single character
        if (bites.length === 1 && input.length > 17) {
            bites = [];
            for (i = 0; i < input.length; i += 2) {
                bites.push(input.slice(i, i+2));
            }
        }

        var latin1 = "";
        for (i = 0; i < bites.length; i++) {
            latin1 += Utils.chr(parseInt(bites[i], base));
        }
        return Utils.strToByteArray(latin1);
    },


    /**
     * Highlight to hex
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightTo: function(pos, args) {
        var delim = Utils.charRep[args[0] || "Space"],
            len = delim === "\r\n" ? 1 : delim.length;

        pos[0].start = pos[0].start * (2 + len);
        pos[0].end = pos[0].end * (2 + len) - len;

        // 0x and \x are added to the beginning if they are selected, so increment the positions accordingly
        if (delim === "0x" || delim === "\\x") {
            pos[0].start += 2;
            pos[0].end   += 2;
        }
        return pos;
    },


    /**
     * Highlight to hex
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightFrom: function(pos, args) {
        var delim = Utils.charRep[args[0] || "Space"],
            len = delim === "\r\n" ? 1 : delim.length,
            width = len + 2;

        // 0x and \x are added to the beginning if they are selected, so increment the positions accordingly
        if (delim === "0x" || delim === "\\x") {
            if (pos[0].start > 1) pos[0].start -= 2;
            else pos[0].start = 0;
            if (pos[0].end > 1) pos[0].end -= 2;
            else pos[0].end = 0;
        }

        pos[0].start = pos[0].start === 0 ? 0 : Math.round(pos[0].start / width);
        pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / width);
        return pos;
    },


    /**
     * To Decimal operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToDecimal: function(input, args) {
        var delim = Utils.charRep[args[0]];
        return input.join(delim);
    },


    /**
     * From Decimal operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFromDecimal: function(input, args) {
        var delim = Utils.charRep[args[0]];
        var byteStr = input.split(delim), output = [];
        if (byteStr[byteStr.length-1] === "")
            byteStr = byteStr.slice(0, byteStr.length-1);

        for (var i = 0; i < byteStr.length; i++) {
            output[i] = parseInt(byteStr[i], 10);
        }
        return output;
    },


    /**
     * To Binary operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToBinary: function(input, args) {
        var delim = Utils.charRep[args[0] || "Space"],
            output = "",
            padding = 8;

        for (var i = 0; i < input.length; i++) {
            output += Utils.pad(input[i].toString(2), padding) + delim;
        }

        if (delim.length) {
            return output.slice(0, -delim.length);
        } else {
            return output;
        }
    },


    /**
     * From Binary operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFromBinary: function(input, args) {
        if (args[0] !== "None") {
            var delimRegex = Utils.regexRep[args[0] || "Space"];
            input = input.replace(delimRegex, "");
        }

        var output = [];
        var byteLen = 8;
        for (var i = 0; i < input.length; i += byteLen) {
            output.push(parseInt(input.substr(i, byteLen), 2));
        }
        return output;
    },


    /**
     * Highlight to binary
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightToBinary: function(pos, args) {
        var delim = Utils.charRep[args[0] || "Space"];
        pos[0].start = pos[0].start * (8 + delim.length);
        pos[0].end = pos[0].end * (8 + delim.length) - delim.length;
        return pos;
    },


    /**
     * Highlight from binary
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightFromBinary: function(pos, args) {
        var delim = Utils.charRep[args[0] || "Space"];
        pos[0].start = pos[0].start === 0 ? 0 : Math.floor(pos[0].start / (8 + delim.length));
        pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / (8 + delim.length));
        return pos;
    },


    /**
     * @constant
     * @default
     */
    HEX_CONTENT_CONVERT_WHICH: ["Only special chars", "Only special chars including spaces", "All chars"],
    /**
     * @constant
     * @default
     */
    HEX_CONTENT_SPACES_BETWEEN_BYTES: false,

    /**
     * To Hex Content operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToHexContent: function(input, args) {
        var convert = args[0];
        var spaces = args[1];
        if (convert === "All chars") {
            var result = "|" + Utils.toHex(input) + "|";
            if (!spaces) result = result.replace(/ /g, "");
            return result;
        }

        var output = "",
            inHex = false,
            convertSpaces = convert === "Only special chars including spaces",
            b;
        for (var i = 0; i < input.length; i++) {
            b = input[i];
            if ((b === 32 && convertSpaces) || (b < 48 && b !== 32) || (b > 57 && b < 65) || (b > 90 && b < 97) || b > 122) {
                if (!inHex) {
                    output += "|";
                    inHex = true;
                } else if (spaces) output += " ";
                output += Utils.toHex([b]);
            } else {
                if (inHex) {
                    output += "|";
                    inHex = false;
                }
                output += Utils.chr(input[i]);
            }
        }
        if (inHex) output += "|";
        return output;
    },


    /**
     * From Hex Content operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFromHexContent: function(input, args) {
        var regex = /\|([a-f\d ]{2,})\|/gi;
        var output = [], m, i = 0;
        while ((m = regex.exec(input))) {
            // Add up to match
            for (; i < m.index;)
                output.push(Utils.ord(input[i++]));

            // Add match
            var bytes = Utils.fromHex(m[1]);
            if (bytes) {
                for (var a = 0; a < bytes.length;)
                    output.push(bytes[a++]);
            } else {
                // Not valid hex, print as normal
                for (; i < regex.lastIndex;)
                    output.push(Utils.ord(input[i++]));
            }

            i = regex.lastIndex;
        }
        // Add all after final match
        for (; i < input.length;)
            output.push(Utils.ord(input[i++]));

        return output;
    },

};
