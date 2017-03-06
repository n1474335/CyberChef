/* globals prettyPrintOne, vkbeautify, xpath */

/**
 * Code operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Code = {

    /**
     * @constant
     * @default
     */
    LANGUAGES: ["default-code", "default-markup", "bash", "bsh", "c", "cc", "coffee", "cpp", "cs", "csh", "cv", "cxx", "cyc", "htm", "html", "in.tag", "java", "javascript", "js", "json", "m", "mxml", "perl", "pl", "pm", "py", "python", "rb", "rc", "rs", "ruby", "rust", "sh", "uq.val", "xhtml", "xml", "xsl"],
    /**
     * @constant
     * @default
     */
    LINE_NUMS: false,

    /**
     * Syntax highlighter operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runSyntaxHighlight: function(input, args) {
        var language = args[0],
            lineNums = args[1];
        return "<code class='prettyprint'>" + prettyPrintOne(Utils.escapeHtml(input), language, lineNums) + "</code>";
    },


    /**
     * @constant
     * @default
     */
    BEAUTIFY_INDENT: "\\t",

    /**
     * XML Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runXmlBeautify: function(input, args) {
        var indentStr = args[0];
        return vkbeautify.xml(input, indentStr);
    },


    /**
     * JSON Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runJsonBeautify: function(input, args) {
        var indentStr = args[0];
        if (!input) return "";
        return vkbeautify.json(input, indentStr);
    },


    /**
     * CSS Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCssBeautify: function(input, args) {
        var indentStr = args[0];
        return vkbeautify.css(input, indentStr);
    },


    /**
     * SQL Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSqlBeautify: function(input, args) {
        var indentStr = args[0];
        return vkbeautify.sql(input, indentStr);
    },


    /**
     * @constant
     * @default
     */
    PRESERVE_COMMENTS: false,

    /**
     * XML Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runXmlMinify: function(input, args) {
        var preserveComments = args[0];
        return vkbeautify.xmlmin(input, preserveComments);
    },


    /**
     * JSON Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runJsonMinify: function(input, args) {
        if (!input) return "";
        return vkbeautify.jsonmin(input);
    },


    /**
     * CSS Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCssMinify: function(input, args) {
        var preserveComments = args[0];
        return vkbeautify.cssmin(input, preserveComments);
    },


    /**
     * SQL Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSqlMinify: function(input, args) {
        return vkbeautify.sqlmin(input);
    },


    /**
     * Generic Code Beautify operation.
     *
     * Yeeeaaah...
     *
     * I'm not proud of this code, but seriously, try writing a generic lexer and parser that
     * correctly generates an AST for multiple different languages. I have tried, and I can tell
     * you it's pretty much impossible.
     *
     * This basically works. That'll have to be good enough. It's not meant to produce working code,
     * just slightly more readable code.
     *
     * Things that don't work:
     *  - For loop formatting
     *  - Do-While loop formatting
     *  - Switch/Case indentation
     *  - Bit shift operators
     *
     * @author n1474335 [n1474335@gmail.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runGenericBeautify: function(input, args) {
        var code = input,
            t = 0,
            preservedTokens = [],
            m;

        // Remove strings
        var sstrings = /'([^'\\]|\\.)*'/g;
        while ((m = sstrings.exec(code))) {
            code = preserveToken(code, m, t++);
            sstrings.lastIndex = m.index;
        }

        var dstrings = /"([^"\\]|\\.)*"/g;
        while ((m = dstrings.exec(code))) {
            code = preserveToken(code, m, t++);
            dstrings.lastIndex = m.index;
        }

        // Remove comments
        var scomments = /\/\/[^\n\r]*/g;
        while ((m = scomments.exec(code))) {
            code = preserveToken(code, m, t++);
            scomments.lastIndex = m.index;
        }

        var mcomments = /\/\*[\s\S]*?\*\//gm;
        while ((m = mcomments.exec(code))) {
            code = preserveToken(code, m, t++);
            mcomments.lastIndex = m.index;
        }

        var hcomments = /(^|\n)#[^\n\r#]+/g;
        while ((m = hcomments.exec(code))) {
            code = preserveToken(code, m, t++);
            hcomments.lastIndex = m.index;
        }

        // Remove regexes
        var regexes = /\/.*?[^\\]\/[gim]{0,3}/gi;
        while ((m = regexes.exec(code))) {
            code = preserveToken(code, m, t++);
            regexes.lastIndex = m.index;
        }

        // Create newlines after ;
        code = code.replace(/;/g, ";\n");

        // Create newlines after { and around }
        code = code.replace(/{/g, "{\n");
        code = code.replace(/}/g, "\n}\n");

        // Remove carriage returns
        code = code.replace(/\r/g, "");

        // Remove all indentation
        code = code.replace(/^\s+/g, "");
        code = code.replace(/\n\s+/g, "\n");

        // Remove trailing spaces
        code = code.replace(/\s*$/g, "");

        // Remove newlines before {
        code = code.replace(/\n{/g, "{");

        // Indent
        var i = 0,
            level = 0;
        while (i < code.length) {
            switch (code[i]) {
                case "{":
                    level++;
                    break;
                case "\n":
                    if (i+1 >= code.length) break;

                    if (code[i+1] === "}") level--;
                    var indent = (level >= 0) ? Array(level*4+1).join(" ") : "";

                    code = code.substring(0, i+1) + indent + code.substring(i+1);
                    if (level > 0) i += level*4;
                    break;
            }
            i++;
        }

        // Add strategic spaces
        code = code.replace(/\s*([!<>=+-/*]?)=\s*/g, " $1= ");
        code = code.replace(/\s*<([=]?)\s*/g, " <$1 ");
        code = code.replace(/\s*>([=]?)\s*/g, " >$1 ");
        code = code.replace(/([^+])\+([^+=])/g, "$1 + $2");
        code = code.replace(/([^-])-([^-=])/g, "$1 - $2");
        code = code.replace(/([^*])\*([^*=])/g, "$1 * $2");
        code = code.replace(/([^/])\/([^/=])/g, "$1 / $2");
        code = code.replace(/\s*,\s*/g, ", ");
        code = code.replace(/\s*{/g, " {");
        code = code.replace(/}\n/g, "}\n\n");

        // Just... don't look at this
        code = code.replace(/(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)\s*\n([^{])/gim, "$1 ($2)\n    $3");
        code = code.replace(/(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)([^{])/gim, "$1 ($2) $3");
        code = code.replace(/else\s*\n([^{])/gim, "else\n    $1");
        code = code.replace(/else\s+([^{])/gim, "else $1");

        // Remove strategic spaces
        code = code.replace(/\s+;/g, ";");
        code = code.replace(/\{\s+\}/g, "{}");
        code = code.replace(/\[\s+\]/g, "[]");
        code = code.replace(/}\s*(else|catch|except|finally|elif|elseif|else if)/gi, "} $1");


        // Replace preserved tokens
        var ptokens = /###preservedToken(\d+)###/g;
        while ((m = ptokens.exec(code))) {
            var ti = parseInt(m[1], 10);
            code = code.substring(0, m.index) + preservedTokens[ti] + code.substring(m.index + m[0].length);
            ptokens.lastIndex = m.index;
        }

        return code;

        /**
         * Replaces a matched token with a placeholder value.
         */
        function preserveToken(str, match, t) {
            preservedTokens[t] = match[0];
            return str.substring(0, match.index) +
                "###preservedToken" + t + "###" +
                str.substring(match.index + match[0].length);
        }
    },


    /**
     * @constant
     * @default
     */
    XPATH_INITIAL: "",

    /**
     * @constant
     * @default
     */
    XPATH_DELIMITER: "\\n",

    /**
     * XPath expression operation.
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runXpath:function(input, args) {
        var query = args[0],
            delimiter = args[1];

        var xml;
        try {
            xml = $.parseXML(input);
        } catch (err) {
            return "Invalid input XML.";
        }

        var result;
        try {
            result = xpath.evaluate(xml, query);
        } catch (err) {
            return "Invalid XPath. Details:\n" + err.message;
        }

        var serializer = new XMLSerializer();
        var nodeToString = function(node) {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE: return serializer.serializeToString(node);
                case Node.ATTRIBUTE_NODE: return node.value;
                case Node.COMMENT_NODE: return node.data;
                case Node.DOCUMENT_NODE: return serializer.serializeToString(node);
                default: throw new Error("Unknown Node Type: " + node.nodeType);
            }
        };

        return Object.keys(result).map(function(key) {
            return result[key];
        }).slice(0, -1) // all values except last (length)
        .map(nodeToString)
        .join(delimiter);
    },


    /**
     * @constant
     * @default
     */
    CSS_SELECTOR_INITIAL: "",

    /**
     * @constant
     * @default
     */
    CSS_QUERY_DELIMITER: "\\n",

    /**
     * CSS selector operation.
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     * @author n1474335 [n1474335@gmail.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCSSQuery: function(input, args) {
        var query = args[0],
            delimiter = args[1],
            parser = new DOMParser(),
            html,
            result;

        if (!query.length || !input.length) {
            return "";
        }

        try {
            html = parser.parseFromString(input, "text/html");
        } catch (err) {
            return "Invalid input HTML.";
        }

        try {
            result = html.querySelectorAll(query);
        } catch (err) {
            return "Invalid CSS Selector. Details:\n" + err.message;
        }

        var nodeToString = function(node) {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE: return node.outerHTML;
                case Node.ATTRIBUTE_NODE: return node.value;
                case Node.COMMENT_NODE: return node.data;
                case Node.TEXT_NODE: return node.wholeText;
                case Node.DOCUMENT_NODE: return node.outerHTML;
                default: throw new Error("Unknown Node Type: " + node.nodeType);
            }
        };

        return Array.apply(null, Array(result.length))
            .map(function(_, i) {
                return result[i];
            })
            .map(nodeToString)
            .join(delimiter);
    },

};
