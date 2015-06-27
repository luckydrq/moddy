/**!
 * moddy - lib/module.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/**
 * Module dependencies.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _fs = require('fs');

var _events = require('events');

var _nativeOrBluebird = require('native-or-bluebird');

var _nativeOrBluebird2 = _interopRequireDefault(_nativeOrBluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _util = require('./util');

var debug = (0, _debug2['default'])('moddy:module');

var Module = (function (_EE) {
  function Module(options) {
    var _this = this;

    _classCallCheck(this, Module);

    _get(Object.getPrototypeOf(Module.prototype), 'constructor', this).call(this);

    options = options || {
      parent: null,
      path: process.cwd()
    };
    (0, _assert2['default'])(options.path, 'module path required');

    if (options.rules) {
      (0, _assert2['default'])(typeof options.rules, 'rules should be object');
    }

    this.options = options;
    this.parent = options.parent;
    this.path = (0, _path.resolve)(options.path);
    this.rules = options.rules;
    this.deps = [];
    this.loaded = false;

    this.on('loaded', function (m) {
      _this.loaded = true;
      debug('module loaded, name: ' + m.name + ', version: ' + m.version + ', path: ' + m.path);
    });
  }

  _inherits(Module, _EE);

  _createClass(Module, [{
    key: 'load',
    value: function load() {
      var _this2 = this;

      try {
        var pkg = require((0, _path.join)(this.path, 'package.json'));
        _lodash2['default'].defaults(this, pkg);
        if (!this.name) {
          this.name = (0, _path.basename)(this.path);
        }

        // 校验没通过，不符合rule的包
        if (!this.validate()) {
          return _nativeOrBluebird2['default'].resolve();
        }
      } catch (e) {
        debug('load module error: ' + e.stack);
        return _nativeOrBluebird2['default'].reject(e);
      }

      var defer = _nativeOrBluebird2['default'].defer();
      var subPromises = [];
      var npath = (0, _path.join)(this.path, 'node_modules');

      (0, _fs.exists)(npath, function (yes) {
        if (yes) {
          (0, _fs.readdir)(npath, function (err, files) {
            if (err) return defer.reject(err);

            files = files.map(function (file) {
              return (0, _path.join)(npath, file);
            }).filter(_util.isNodeModule);

            var count = 0;
            files.forEach(function (fpath) {
              ++count;

              var options = _lodash2['default'].defaults({}, {
                parent: _this2,
                path: fpath
              }, _this2.options);
              var mod = new Module(options);
              subPromises.push(mod.load());
              mod.on('loaded', function (m) {
                return _this2.deps.push(m);
              });

              if (subPromises.length === count) {
                _nativeOrBluebird2['default'].all(subPromises).then(function () {
                  // 等所有依赖的模块load后才算load成功
                  defer.resolve(_this2);
                  _this2.emit('loaded', _this2);
                });
              }
            });
          });
        } else {
          defer.resolve(_this2);
          _this2.emit('loaded', _this2);
        }
      });

      return defer.promise;
    }
  }, {
    key: 'validate',
    value: function validate() {
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
  }]);

  return Module;
})(_events.EventEmitter);

exports['default'] = Module;
module.exports = exports['default'];