Backported `fs.*FileSync` Functions
===================================

[![Build Status: Linux](https://img.shields.io/travis/kevinoid/fs-file-sync-fd.svg?style=flat&label=build+on+linux)](https://travis-ci.org/kevinoid/fs-file-sync-fd)
[![Build Status: Windows](https://img.shields.io/appveyor/ci/kevinoid/fs-file-sync-fd.svg?style=flat&label=build+on+windows)](https://ci.appveyor.com/project/kevinoid/fs-file-sync-fd)
[![Dependency Status](https://img.shields.io/david/kevinoid/fs-file-sync-fd.svg?style=flat)](https://david-dm.org/kevinoid/fs-file-sync-fd)
[![Supported Node Version](https://img.shields.io/node/v/fs-file-sync-fd.svg?style=flat)](https://www.npmjs.com/package/fs-file-sync-fd)
[![Version on NPM](https://img.shields.io/npm/v/fs-file-sync-fd.svg?style=flat)](https://www.npmjs.com/package/fs-file-sync-fd)

Standalone version of `fs.readFileSync`, `fs.writeFileSync`, and
`fs.appendFileSync` which accept file descriptor arguments for synchronously
reading and writing to open file descriptors (a change introduced in
[nodejs/node@08039628](https://github.com/nodejs/node/commit/08039628), which
first appeared in Node v6.0.0).

This module uses the `fs` module sources and tests from
[nodejs/node@08039628](https://github.com/nodejs/node/commit/08039628) with
subsequent updates and only the changes necessary to support older versions of
Node.js (e.g.  replacing octal literals with decimal to support v0.12 and
earlier).

When running on Node v6.0.0 or later, importing this module is equivalent to
importing the `fs` module directly.

## Introductory Example

```js
var fs = require('fs-file-sync-fd');

var fd = fs.openSync('package.json', 'r');
var packageJson = JSON.parse(fs.readFileSync(fd, {encoding: 'utf8'}));
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

* [appendFileSync](https://nodejs.org/api/fs.html#fs_fs_appendfilesync_file_data_options)
* [readFileSync](https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options)
* [writeFileSync](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)

## License

This package is available under the terms of the
[MIT License](https://opensource.org/licenses/MIT).
