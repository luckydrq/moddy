/**!
 * moddy - lib/module.js
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
  resolve,
  join,
  basename
} from 'path';
import {
  readdir,
  readdirSync,
  stat,
  exists,
  existsSync
} from 'fs';
import { EventEmitter as EE } from 'events';
import Promise from 'native-or-bluebird';
import _ from 'lodash';
import log from 'debug';
import {
  isModule,
  isDir
} from './util';

var debug = log('moddy:module');

export default class Module extends EE {
  constructor(options) {
    super();

    assert(options.path, 'module path required');
    if (options.rules) {
      assert(typeof options.rules, 'rules should be object');
    }

    this.options = options;
    this.parent = options.parent;
    this.path = resolve(options.path);
    this.rules = options.rules;
    this.deps = [];
    this.loaded = false;

    this.on('loaded', m => {
      this.loaded = true;
      debug(`module loaded, name: ${m.name}, version: ${m.version}, path: ${m.path}`);
    });
  }

  load() {
    try {
      var packageFile = this.options.packageFile;
      var pkg = require(join(this.path, packageFile));
      _.defaults(this, pkg);
      if (!this.name) {
        this.name = basename(this.path);
      }

      // 校验没通过，不符合rule的包
      if (!this.validate()) {
        return Promise.resolve();
      }
    } catch(e) {
      debug(`load module error: ${e.stack}`);
      return Promise.reject(e);
    }

    var defer = Promise.defer();
    var subPromises = [];
    var packageDir = this.options.packageDir;
    var packagePath = join(this.path, packageDir);

    exists(packagePath, yes => {
      if (yes) {
        readdir(packagePath, (err, files) => {
          if (err) return defer.reject(err);

          // 处理scope目录
          var scopeDir = this.options.scopeDir;
          if (scopeDir) {
            var scopePath = join(packagePath, scopeDir);
            if (existsSync(scopePath) && isDir(scopePath)) {
              files = files.concat(
                readdirSync(scopePath)
                .map(file => scopeDir + '/' + file)
              );
            }
          }

          files = files
            .map(file => join(packagePath, file))
            .filter(file => {
              return isModule(file, packageFile);
            });
          if (files.length === 0) {
            return defer.resolve(this);
          }

          var count = 0;
          files.forEach(fpath => {
            ++count;

            var options = _.defaults({}, {
              parent: this,
              path: fpath
            }, this.options);
            var mod = new Module(options);
            subPromises.push(mod.load());
            mod.on('loaded', m => this.deps.push(m));

            if (subPromises.length === count) {
              Promise.all(subPromises)
                .then(() => {
                  // 等所有依赖的模块load后才算load成功
                  defer.resolve(this);
                  this.emit('loaded', this);
                });
            }
          });
        });
      } else {
        defer.resolve(this);
        this.emit('loaded', this);
      }
    });

    return defer.promise;
  }

  validate() {
    if (typeof this.rules !== 'object') {
      return true;
    }

    var keys = Object.keys(this.rules);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var rule = this.rules[key];
      if (rule instanceof RegExp) {
        return rule.test(this[key]);
      } else if (typeof rule === 'function') {
        return rule(this[key]);
      } else {
        return rule === this[key];
      }
    }

    return true;
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      path: this.path,
      deps: this.deps,
      rules: this.rules,
      loaded: this.loaded
    };
  }
}
