# flow-typestrip [![Build Status](https://travis-ci.org/fkling/flow-typestrip.svg?branch=master)](https://travis-ci.org/fkling/flow-typestrip)

flow-typestrip is a [recast](https://www.npmjs.org/package/recast) based
transform to remove [**Flow**](http://flowtype.org/) type annotations from
typed JavaScript code, so that the code can be executed in JavaScript environments.

**Alternatives:** [react-tools](https://www.npmjs.org/package/react-tools) also
[strips type annotations](http://flowtype.org/docs/running.htm).

## !!Caveat!!
flow-typestrip is currently not able to process files with
[type aliases](http://flowtype.org/docs/type-aliases.html), [declarations](http://flowtype.org/docs/declarations.html)
and interfaces, because these nodes lack support in ast-types. [A pull request
to add support is out](https://github.com/benjamn/ast-types/pull/77).

If you need support for this now, you should use
[react-tools](https://www.npmjs.org/package/react-tools) instead.

## Install

```sh
$ npm install [-D] flow-typestrip
```

## Usage

### As a CLI

flow-typstrip comes with a command-line interface that can be used when installed
globally. Here is how to convert a single file and print to stdout:

```sh
$ flow-typestrip source.js
```

To compile many files at once, specify an output directory:

```sh
$ flow-typestrip -o dist src/**/*.js
```

To enable source maps for this files, add the `--source-maps` flag.

### As a library


```js
var flowStrip = require('flow-typestrip');
var result = flowStrip.compile(source, {
  sourceFileName: 'example.js',
  sourceMapName: 'example.js.map'
});

fs.writeFileSync('result.js', result.code);
fs.writeFileSync('result.js.map', JSON.stringify(result.map));
```

### With browserify

flow-typestrip can directly be used with [browserify](http://browserify.org/):

```sh
$ browserify -t flow-typestrip script.js
```

## Development

If you look at the [main transform function](index.js), it is very simple. To
ensure that the types are stripped correctly, I'm using the unit tests from
[jstransform](https://github.com/facebook/jstransform).

## Acknowledgments

- [Facebook](https://github.com/facebook) for building [Flow](https://github.com/facebook/flow) (and [jstransform](https://github.com/facebook/jstransform)).
- [Ben Newman](https://github.com/benjamn) for building [recast](https://github.com/benjamn/recast) and [ast-types](https://github.com/benjamn/ast-types).
