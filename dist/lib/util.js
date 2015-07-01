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
exports.isModule = isModule;
exports.isDir = isDir;
/**
 * Module dependencies.
 */

var _path = require('path');

var _fs = require('fs');

function isModule(dir, pkgFile) {
  var pkgPath = (0, _path.join)(dir, pkgFile);
  return (0, _fs.statSync)(dir).isDirectory() && (0, _fs.existsSync)(pkgPath);
}

function isDir(dir) {
  return (0, _fs.statSync)(dir).isDirectory();
}