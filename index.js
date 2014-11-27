/*jshint node:true*/
"use strict";

var through = require('through');
var recast = require('recast');
var types = recast.types;

function remove(path) {
  path.replace();
  return false;
}

function transformClass(path) {
  path.get('typeParameters').replace();
  path.get('superTypeParameters').replace();
  path.get('implements').replace();
  this.traverse(path);
}

function transformPattern(path) {
  path.get('typeAnnotation').replace();
  this.traverse(path);
}


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

  types.visit(ast, {
    visitIdentifier: function(path) {
      path.get('optional').replace();
      path.get('typeAnnotation').replace();
      return false;
    },
    visitFunction: function(path) {
      path.get('returnType').replace();
      path.get('typeParameters').replace();
      this.traverse(path);
    },
    visitClassDeclaration: transformClass,
    visitClassExpression: transformClass,
    visitArrayPattern: transformPattern,
    visitObjectPattern: transformPattern,
    visitTypeAnnotation: remove,
    visitClassImplements: remove,
    visitClassProperty: remove,
    visitInterfaceDeclaration: remove,
    visitTypeAlias: remove,
    visitDeclareVariable: remove,
    visitDeclareFunction: remove,
    visitDeclareClass: remove,
    visitDeclareModule: remove,
    visitType: remove,
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
