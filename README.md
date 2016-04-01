Backported `fs.*FileSync` Functions
===================================

[![Build status](https://img.shields.io/travis/kevinoid/fs-file-sync-fd.svg?style=flat)](https://travis-ci.org/kevinoid/fs-file-sync-fd)
[![Dependency Status](https://img.shields.io/david/kevinoid/fs-file-sync-fd.svg?style=flat)](https://david-dm.org/kevinoid/fs-file-sync-fd)
[![Supported Node Version](https://img.shields.io/node/v/fs-file-sync-fd.svg?style=flat)](https://www.npmjs.com/package/fs-file-sync-fd)
[![Version on NPM](https://img.shields.io/npm/v/fs-file-sync-fd.svg?style=flat)](https://www.npmjs.com/package/fs-file-sync-fd)

Standalone version of `fs.readFileSync`, `fs.writeFileSync`, and
`fs.appendFileSync` from
[nodejs/node@08039628](https://github.com/nodejs/node/commit/08039628), which
accept file descriptor arguments for synchronously reading and writing to open
file descriptors.

This module uses the `fs` module sources and tests from
[nodejs/node@08039628](https://github.com/nodejs/node/commit/08039628) with
only the changes necessary to support older versions of Node.js (e.g.
replacing octal literals with decimal to support v0.12 and earlier).

When running on a version of Node.js which includes `08039628`, the `fs`
functions will be returned in preference to the versions in this module.

## Introductory Example

```js
var fs = require('fs');
var readFileSync = require('fs-file-sync-fd').readFileSync;

var fd = fs.openSync('package.json', 'r');
var packageJson = JSON.parse(readFileSync(fd, {encoding: 'utf8'}));
console.log('Package Version: ' + packageJson.version);
```

## Installation

[This package](https://www.npmjs.com/package/fs-file-sync-fd) can be
installed using [npm](https://www.npmjs.com/), either globally or locally, by
running:

```sh
npm install fs-file-sync-fd
```

## Recipes

### Read everything from stdin

```js
var readFileSync = require('fs-file-sync-fd').readFileSync;
var stdinContent = readFileSync(0);
```

### Append to stdout

```js
var appendFileSync = require('fs-file-sync-fd').appendFileSync;
appendFileSync(1, 'Hello ');
appendFileSync(1, 'World\n');
```

## API Docs

The functions in this module are documented as part of the Node.js API:

* [appendFileSync](https://github.com/nodejs/node/blob/4d4f3535/doc/api/fs.markdown#fsappendfilesyncfile-data-options)
* [readFileSync](https://github.com/nodejs/node/blob/4d4f3535/doc/api/fs.markdown#fsreadfilesyncfile-options)
* [writeFileSync](https://github.com/nodejs/node/blob/4d4f3535/doc/api/fs.markdown#fswritefilesyncfile-data-options)

## License

This package is available under the terms of the
[MIT License](https://opensource.org/licenses/MIT).
