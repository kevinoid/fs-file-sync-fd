/**
 * @copyright Copyright 2016 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */
'use strict';

var fsFileSyncFD = require('./fs-file-sync-fd');

// TODO:  Add process.version check once a release includes 08039628 and
// return functions from fs when they support file descriptor arguments.
module.exports = fsFileSyncFD;
