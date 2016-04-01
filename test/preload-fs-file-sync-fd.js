/** Module to preload the fs-file-sync-fd functions into the fs module.
 * By doing this, the Node.js tests can be used without modification.
 *
 * Note:  For 1.6.0 and later, using a preload module (-r) would be preferable,
 * but these tests need to work on 0.10 and 0.12, so it runs as a main module.
 *
 * @copyright Copyright 2016 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */
'use strict';

var fs = require('fs');
var fsFSFD = require('../fs-file-sync-fd');

fs.appendFileSync = fsFSFD.appendFileSync;
fs.readFileSync = fsFSFD.readFileSync;
fs.writeFileSync = fsFSFD.writeFileSync;

// Remove this module from argv
process.argv.splice(1, 1);

// If any modules relied on require.main === module, this could be fixed with:
// var Module = require('module');
// Module._load(process.argv[1], null, true);
//
// Since they don't, stick with public API:
require(process.argv[1]);
