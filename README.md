# moddy
An util tool for searching modules(not just node module)

Conceptly, `module` and `package` are the same thing.

** Notice: If all of the sub directories cannot be found as a
module, it will stop searching in that path **

# Install
`$ npm install moddy`

# Quick start

```javascript
  var Moddy = requrie('moddy');
  var options = {
    searchPaths: ['.']
  };
  Moddy(options, function(err, mods) {
    if (err) throw err;
    console.log(mods);
    /*
    [{
      name: 'modA',
      version: '1.0.0',
      path: '/application/modules/modA',
      deps: [{
        name: 'modB',
        version: '2.0.0',
        path: '/application/modules/modA/node_modules/modB'
        deps: [],
        ...
      }],
      ...
    }, ...]
    */
  });
```

# API

## Moddy([options,] callback)

### `options`

optional

- options.searchPaths

{Array} specify search path to find node modules, default to
`process.cwd()`

- options.rules

{Object} Each `key-value` pair stands for a certain rule for field validation of module's `package.json`. e.g. `{ name: 'koa' }` matches module with a name `koa` which as we all know and `{ name: /^koa-.*/ }` matches all the modules that have a name prefixed with `koa-` and `{ name: function(val) { return val !== 'koa'} }` matches any module whose name is not `koa`(in this case, param `val` is the value of that field in `package.json`). So `value` can be `RegExp`, `function` or any primative value.

- options.packageDir

{String} Directory that modules locate. Default to
`node_modules`. If you want to search bower components, set it to
`bower_components`.

- options.packageFile

{String} Package file. Defaults to `package.json`.

- options.scopeDir

{String} Scope of module. A module's name may be prefixed with a scope name. e.g. a module named with `xxx/yy` has scope `xxx` and it locates at `node_modules/xxx/yy` when installed. Defaults to ''.

### `callback`

node-style callback that takes in two params: `err`, `mods`.

`mods` is a collection of modules. Each module includes all the fields of its `package.json` and with extra `path`, `deps` fields.`path` is the absolute path of the module and `deps` is a collection of modules that it depends on.

# LISENCE

MIT
