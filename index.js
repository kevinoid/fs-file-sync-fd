/**
 * @copyright Copyright 2016 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

// Note:  Feature detection is both expensive (syscall overhead) and difficult
// to get right.  Use version detection instead.
module.exports = process.versions.node.split('.')[0] >= 6 ?
  require('fs') :
  require('./fs-file-sync-fd');
