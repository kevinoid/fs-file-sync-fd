/**
 * This is a copy of fs.readFileSync, fs.writeFileSync, and fs.appendFileSync
 * (and supporting functions) from lib/fs.js with the following changes:
 * - Replace ES6 octal literals with decimal literals to allow using the
 *   module on Node 0.12 and earlier.
 * - Continue using Buffer constructor instead of Buffer.allocUnsafe and
 *   Buffer.from to support Node 5.9 and earlier.
 *
 * @copyright Copyright Node.js contributors. All rights reserved.
 * @license MIT
 */

'use strict';

var util = require('util');

// This module exports an augmented version of the the fs module without
// modifying the fs module by "subclassing" it prototypally.
var fs = Object.create(require('fs'));

function getOptions(options, defaultOptions) {
  if (options === null || options === undefined ||
      typeof options === 'function') {
    return defaultOptions;
  }

  if (typeof options === 'string') {
    defaultOptions = util._extend({}, defaultOptions);
    defaultOptions.encoding = options;
    options = defaultOptions;
  } else if (typeof options !== 'object') {
    throw new TypeError('"options" must be a string or an object, got ' +
                        typeof options + ' instead.');
  }

  if (options.encoding !== 'buffer')
    assertEncoding(options.encoding);
  return options;
}

function copyObject(source, target) {
  target = arguments.length >= 2 ? target : {};
  for (var key in source)
    target[key] = source[key];
  return target;
}

function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

function isFd(path) {
  return (path >>> 0) === path;
}

function tryStatSync(fd, isUserFd) {
  var threw = true;
  var st;
  try {
    st = fs.fstatSync(fd);
    threw = false;
  } finally {
    if (threw && !isUserFd) fs.closeSync(fd);
  }
  return st;
}

function tryCreateBuffer(size, fd, isUserFd) {
  var threw = true;
  var buffer;
  try {
    buffer = new Buffer(size);
    threw = false;
  } finally {
    if (threw && !isUserFd) fs.closeSync(fd);
  }
  return buffer;
}

function tryReadSync(fd, isUserFd, buffer, pos, len) {
  var threw = true;
  var bytesRead;
  try {
    bytesRead = fs.readSync(fd, buffer, pos, len);
    threw = false;
  } finally {
    if (threw && !isUserFd) fs.closeSync(fd);
  }
  return bytesRead;
}

fs.readFileSync = function(path, options) {
  options = getOptions(options, { flag: 'r' });
  var isUserFd = isFd(path); // file descriptor ownership
  var fd = isUserFd ? path : fs.openSync(path, options.flag || 'r', 438);

  var st = tryStatSync(fd, isUserFd);
  var size = st.isFile() ? st.size : 0;
  var pos = 0;
  var buffer; // single buffer with file data
  var buffers; // list for when size is unknown

  if (size === 0) {
    buffers = [];
  } else {
    buffer = tryCreateBuffer(size, fd, isUserFd);
  }

  var bytesRead;

  if (size !== 0) {
    do {
      bytesRead = tryReadSync(fd, isUserFd, buffer, pos, size - pos);
      pos += bytesRead;
    } while (bytesRead !== 0 && pos < size);
  } else {
    do {
      // the kernel lies about many files.
      // Go ahead and try to read some bytes.
      buffer = new Buffer(8192);
      bytesRead = tryReadSync(fd, isUserFd, buffer, 0, 8192);
      if (bytesRead !== 0) {
        buffers.push(buffer.slice(0, bytesRead));
      }
      pos += bytesRead;
    } while (bytesRead !== 0);
  }

  if (!isUserFd)
    fs.closeSync(fd);

  if (size === 0) {
    // data was collected into the buffers list.
    buffer = Buffer.concat(buffers, pos);
  } else if (pos < size) {
    buffer = buffer.slice(0, pos);
  }

  if (options.encoding) buffer = buffer.toString(options.encoding);
  return buffer;
};

fs.writeFileSync = function(path, data, options) {
  options = getOptions(options, { encoding: 'utf8', mode: 438, flag: 'w' });
  var flag = options.flag || 'w';

  var isUserFd = isFd(path); // file descriptor ownership
  var fd = isUserFd ? path : fs.openSync(path, flag, options.mode);

  if (!(data instanceof Buffer)) {
    data = new Buffer('' + data, options.encoding || 'utf8');
  }
  var offset = 0;
  var length = data.length;
  var position = /a/.test(flag) ? null : 0;
  try {
    while (length > 0) {
      var written = fs.writeSync(fd, data, offset, length, position);
      offset += written;
      length -= written;
      if (position !== null) {
        position += written;
      }
    }
  } finally {
    if (!isUserFd) fs.closeSync(fd);
  }
};

fs.appendFileSync = function(path, data, options) {
  options = getOptions(options, { encoding: 'utf8', mode: 438, flag: 'a' });

  // Don't make changes directly on options object
  options = copyObject(options);

  // force append behavior when using a supplied file descriptor
  if (!options.flag || isFd(path))
    options.flag = 'a';

  fs.writeFileSync(path, data, options);
};

module.exports = fs;
