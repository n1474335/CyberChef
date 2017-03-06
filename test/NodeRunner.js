/* eslint-env node */

/**
 * NodeRunner.js
 *
 * The purpose of this file is to execute via PhantomJS the file
 * PhantomRunner.js, because PhantomJS is managed by node.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

var path = require("path"),
    phantomjs = require("phantomjs-prebuilt"),
    phantomEntryPoint = path.join(__dirname, "PhantomRunner.js"),
    program = phantomjs.exec(phantomEntryPoint);

program.stdout.pipe(process.stdout);
program.stderr.pipe(process.stderr);

program.on("exit", function(status) {
    process.exit(status);
});
