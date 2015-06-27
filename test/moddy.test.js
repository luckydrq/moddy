/**!
 * moddy - test/moddy.test.js
 *
 * Authors:
 *   luckydrq(http://github.com/luckydrq)
 */

'use strict';

/**
 * Module dependencies.
 */
var assert = require('assert');
var _ = require('lodash');
var Moddy = require('../dist');
var options = {
  searchPaths: ['./test/node_modules', './test/app/modules']
};

describe('moddy test', function() {
  it('should work', function(done) {
    Moddy(options, function(err, mods) {
      if (err) return done(err);

      assert(mods.length === 3);
      mods.forEach(function(m) {
        assert(m.parent == null);
        assert(['express', 'koa', 'modA'].indexOf(m.name) !== -1);
      });
      done();
    });
  });

  it('should support rules using string', function(done) {
    var opt = _.defaults({}, options, {
      rules: {
        name: 'modA'
      }
    });

    Moddy(opt, function(err, mods) {
      if (err) return done(err);

      assert(mods.length === 1);
      assert(mods[0].name === 'modA');
      done();
    });
  });

  it('should support rules using regexp', function(done) {
    var opt = _.defaults({}, options, {
      rules: {
        name: /^mod/
      }
    });

    Moddy(opt, function(err, mods) {
      if (err) return done(err);

      assert(mods.length === 1);
      assert(mods[0].name === 'modA');
      done();
    });
  });
});
