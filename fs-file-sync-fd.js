/**
 * This is a nearly verbatim copy of fs.readFileSync, fs.writeFileSync, and
 * fs.appendFileSync (and private supporting functions) from commit 08039628,
 * which added support for passing a file descriptor in place of a file path.
 *
 * Changes from 08039628:
 * - Replace ES6 octal literals with non-octal literals to allow using the
 *   module on Node 0.12 and earlier.
 *
 * @copyright Copyright Node.js contributors. All rights reserved.
 * @license MIT
 */

'use strict';

var fs = require('fs');
var util = require('util');

var fsFileSyncFD = {};

function throwOptionsError(options) {
  throw new TypeError('Expected options to be either an object or a string, ' +
    'but got ' + typeof options + ' instead');
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
    buffer = Buffer.allocUnsafe(size);
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

fsFileSyncFD.readFileSync = function(path, options) {
  if (!options) {
    options = { encoding: null, flag: 'r' };
  } else if (typeof options === 'string') {
    options = { encoding: options, flag: 'r' };
  } else if (typeof options !== 'object') {
    throwOptionsError(options);
  }

  var encoding = options.encoding;
  assertEncoding(encoding);

  var flag = options.flag || 'r';
  var isUserFd = isFd(path); // file descriptor ownership
  var fd = isUserFd ? path : fs.openSync(path, flag, 438 /*=0o666*/);

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
      buffer = Buffer.allocUnsafe(8192);
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

  if (encoding) buffer = buffer.toString(encoding);
  return buffer;
};

fsFileSyncFD.writeFileSync = function(path, data, options) {
  if (!options) {
    options = { encoding: 'utf8', mode: 438 /*=0o666*/, flag: 'w' };
  } else if (typeof options === 'string') {
    options = { encoding: options, mode: 438 /*=0o666*/, flag: 'w' };
  } else if (typeof options !== 'object') {
    throwOptionsError(options);
  }

  assertEncoding(options.encoding);

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

fsFileSyncFD.appendFileSync = function(path, data, options) {
  if (!options) {
    options = { encoding: 'utf8', mode: 438 /*=0o666*/, flag: 'a' };
  } else if (typeof options === 'string') {
    options = { encoding: options, mode: 438 /*=0o666*/, flag: 'a' };
  } else if (typeof options !== 'object') {
    throwOptionsError(options);
  }

  if (!options.flag)
    options = util._extend({ flag: 'a' }, options);

  // force append behavior when using a supplied file descriptor
  if (isFd(path))
    options.flag = 'a';

  fsFileSyncFD.writeFileSync(path, data, options);
};

module.exports = fsFileSyncFD;
