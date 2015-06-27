/**!
 * moddy - lib/util.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isNodeModule = isNodeModule;
exports.isDir = isDir;
/**
 * Module dependencies.
 */

var _path = require('path');

var _fs = require('fs');

function isNodeModule(dir) {
  var pkgPath = (0, _path.join)(dir, 'package.json');
  return (0, _fs.statSync)(dir).isDirectory() && (0, _fs.existsSync)(pkgPath);
}

function isDir(dir) {
  return (0, _fs.statSync)(dir).isDirectory();
}