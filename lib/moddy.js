/**!
 * moddy - lib/moddy.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

/**
 * Module dependencies.
 */

import assert from 'assert';
import {
  readdirSync as readdir,
  existsSync as exists,
  statSync as stat
} from 'fs';
import {
  join,
  resolve as resolvePath
} from 'path';
import _ from 'lodash';
import log from 'debug';
import Module from './module';
import { isNodeModule, isDir } from './util';

var debug = log('moddy');

const DEFAULT_SEARCH_PATH = process.cwd();

export default function Moddy(options, callback) {
  // 至少要提供
  assert(arguments.length > 0, 'callback should be specified at least');

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // 搜索目录，可以是多个
  var searchPaths = options.searchPaths || DEFAULT_SEARCH_PATH;
  if (typeof searchPaths === 'string') {
    searchPaths = [searchPaths];
  }
  searchPaths = searchPaths
    .map(p => resolvePath(p))
    .filter(isDir);

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
    assert(typeof rules === 'object', 'rules should be object');
  }

  var promises = [];
  searchPaths.forEach((spath) => {
    var npath = readdir(spath)
      .map(p => join(spath, p))
      .filter(isNodeModule)
      .forEach((mpath) => {
        var mod = new Module({
          path: mpath,
          rules: rules
        });
        promises.push(mod.load());
      });
  });

  Promise.all(promises)
    .then((mods) => {
      mods = mods.filter(m => m != null);
      callback(null, mods);
    })
    .catch(err => callback(err));
}

