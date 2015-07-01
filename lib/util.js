/**!
 * moddy - lib/util.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

/**
 * Module dependencies.
 */
import {
  join
} from 'path';
import {
  existsSync as exists,
  statSync as stat
} from 'fs';

export function isModule(dir, pkgFile) {
  var pkgPath = join(dir, pkgFile);
  return stat(dir).isDirectory() && exists(pkgPath);
}

export function isDir(dir) {
  return stat(dir).isDirectory();
}
