/*jshint node:true*/
"use strict";

var through = require('through');
var recast = require('recast');
var types = recast.types;

/**
 * Compile the given Flow typed JavaScript source into JavaScript usable in
 * today's runtime environments.
 *
 * @param {string} source
 * @param {object} options
 * @return {{code:string, map:string}}
 */
function compile(source, options) {
  if (!options) { options = {}; }
  var ast = recast.parse(source, {
    sourceFileName: options.sourceFileName,
    esprima: require('esprima-fb')
  });
  ast = transform(ast, options);
  return recast.print(ast, {
    sourceMapName: options.sourceMapName
  });
}

/**
 * Transform the given typed JavaScript AST into a JavaScript AST
 * usable in today's runtime environments.
 *
 * @param {object} ast
 * @return {object}
 */
function transform(ast) {

   function remove(path) {
     path.replace();
     return false;
   }

  types.visit(ast, {
    visitIdentifier: function(path) {
      path.get('optional').replace();
      path.get('typeAnnotation').replace();
      this.traverse(path);
    },
    visitFunction: function(path) {
      path.get('returnType').replace();
      path.get('typeParameters').replace();
      this.traverse(path);
    },
    visitClassDeclaration: function(path) {
      path.get('typeParameters').replace();
      path.get('superTypeParameters').replace();
      this.traverse(path);
    },
    visitClassExpression: function(path) {
      path.get('typeParameters').replace();
      path.get('superTypeParameters').replace();
      this.traverse(path);
    },
    visitArrayPattern: function(path) {
      path.get('typeAnnotation').replace();
      this.traverse(path);
    },
    visitObjectPattern: function(path) {
      path.get('typeAnnotation').replace();
      this.traverse(path);
    },
    visitClassImplements: remove,
    visitClassProperty: remove,
    visitInterfaceDeclaration: remove
  });

  return ast;
}

module.exports = function () {
  var data = '';
  return through(write, end);

  function write (buf) { data += buf; }
  function end () {
      this.queue(compile(data).code);
      this.queue(null);
  }
};

module.exports.compile = compile;
module.exports.transform = transform;
