# moddy
search node modules gracefully

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

### `callback`

node-style callback that takes in two params: `err`, `mods`.

`mods` is a collection of modules. Each module includes all the fields of its `package.json` and with extra `path`, `deps` fields.`path` is the absolute path of the module and `deps` is a collection of modules that it depends on.

# LISENCE

MIT
