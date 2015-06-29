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

{Object} Each `key-value` pair specifies certain field of `package.json` that represented by `key` to match rule that represented by `value`. e.g. `{ name: 'koa' }` means only module with a name `koa` should be seleted which as we all know it is [koa](https://github.com/koajs/koa) and `{ name: /^koa-.*/ }` means that all the modules that have a name prefixed with `koa-` should be seleted. So `value` in rules can be a `String` or a `RegExp`.

### `callback`

node-style callback that takes in two params: `err`, `mods`.

`mods` is a collection of modules. Each module includes all the fields of its `package.json` and with extra `path`, `deps` fields.`path` is the absolute path of the module and `deps` is a collection of modules that it depends on.
