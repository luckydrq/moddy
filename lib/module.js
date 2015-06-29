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
  stat,
  exists
} from 'fs';
import { EventEmitter as EE } from 'events';
import Promise from 'native-or-bluebird';
import _ from 'lodash';
import log from 'debug';
import { isNodeModule } from './util';

var debug = log('moddy:module');

export default class Module extends EE {
  constructor(options) {
    super();

    options = options || {
      parent: null,
      path: process.cwd()
    };
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

    this.on('loaded', (m) => {
      this.loaded = true;
      debug(`module loaded, name: ${m.name}, version: ${m.version}, path: ${m.path}`);
    });
  }

  load() {
    try {
      var pkg = require(join(this.path, 'package.json'));
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
    var npath = join(this.path, 'node_modules');

    exists(npath, (yes) => {
      if (yes) {
        readdir(npath, (err, files) => {
          if (err) return defer.reject(err);

          files = files
            .map(file => join(npath, file))
            .filter(isNodeModule);

          var count = 0;
          files.forEach((fpath) => {
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
      if (typeof rule === 'string') {
        if (rule !== this[key]) {
          return false;
        }
      } else if (rule instanceof RegExp) {
        if (!rule.test(this[key])) {
          return false;
        }
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
