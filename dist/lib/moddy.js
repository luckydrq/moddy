/**!
 * moddy - lib/moddy.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Moddy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Module dependencies.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fs = require('fs');

var _path = require('path');

var _nodePathExtras = require('node-path-extras');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _module2 = require('./module');

var _module3 = _interopRequireDefault(_module2);

var _util = require('./util');

var debug = (0, _debug2['default'])('moddy');

var DEFAULT_SEARCH_PATH = process.cwd();

function Moddy(options, callback) {
  // 至少要提供
  (0, _assert2['default'])(arguments.length > 0, 'callback should be specified at least');

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // 搜索目录，可以是多个
  var searchPaths = options.searchPaths || DEFAULT_SEARCH_PATH;
  if (typeof searchPaths === 'string') {
    searchPaths = [searchPaths];
  }
  searchPaths = (0, _nodePathExtras.unique)(searchPaths.map(function (p) {
    return (0, _path.resolve)(p);
  }).filter(_util.isDir));

  if (searchPaths.length === 0) {
    throw new Error('invalid searchPaths');
  }

  // 筛选字段配置，`package.json`必须含有相应的字段和值。
  // object类型，key是字段名，value是值，支持string和regexp
  // example:
  // {
  //   name: 'columbus'
  //   version: /^1\.0\.x/
  // }
  var rules = options.rules;
  if (rules) {
    (0, _assert2['default'])(typeof rules === 'object', 'rules should be object');
  }

  // 包安装目录
  var packageDir = options.packageDir || 'node_modules';

  // 包描述文件名
  var packageFile = options.packageFile || 'package.json';

  // 对于带scope的包名，多了一级scope目录
  var scopeDir = options.scopeDir;

  var promises = [];
  searchPaths.forEach(function (spath) {
    (0, _fs.readdirSync)(spath).map(function (p) {
      return (0, _path.join)(spath, p);
    }).filter(function (p) {
      return (0, _util.isModule)(p, packageFile);
    }).forEach(function (p) {
      var mod = new _module3['default']({
        path: p,
        rules: rules,
        packageDir: packageDir,
        packageFile: packageFile,
        scopeDir: scopeDir
      });
      promises.push(mod.load());
    });
  });

  Promise.all(promises).then(function (mods) {
    mods = mods.filter(function (m) {
      return m != null;
    });
    callback(null, mods);
  })['catch'](function (err) {
    return callback(err);
  });
}

module.exports = exports['default'];