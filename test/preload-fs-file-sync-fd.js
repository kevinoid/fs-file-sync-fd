/** Module to preload the fs-file-sync-fd functions into the fs module.
 * By doing this, the Node.js tests can be used without modification.
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
