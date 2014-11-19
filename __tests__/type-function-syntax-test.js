/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

jest.autoMockOff();

describe('static type function syntax', function() {
  var flowStrip;
  var esnext;
  var transform;

  beforeEach(function() {
    flowStrip = require('../');
    esnext = require('esnext');
    transform = function(sourceArray) {
      return esnext.compile(flowStrip.compile(sourceArray.join('\n')).code).code;
    };
  });

  describe('param type annotations', function()  {
    it('strips single param annotation', function()  {
      var code = transform([
        'function foo(param1: bool) {',
        '  return param1;',
        '}',
        '',
        'var bar = function(param1: bool) {',
        '  return param1;',
        '}'
      ]);
      eval(code);
      expect(foo(42)).toBe(42);
      expect(bar(42)).toBe(42);
    });

    it('strips multiple param annotations', function()  {
      var code = transform([
        'function foo(param1: bool, param2: number) {',
        '  return [param1, param2];',
        '}',
        '',
        'var bar = function(param1: bool, param2: number) {',
        '  return [param1, param2];',
        '}'
      ]);
      eval(code);
      expect(foo(true, 42)).toEqual([true, 42]);
      expect(bar(true, 42)).toEqual([true, 42]);
    });

    it('strips higher-order param annotations', function()  {
      var code = transform([
        'function foo(param1: (_:bool) => number) {',
        '  return param1;',
        '}',
        '',
        'var bar = function(param1: (_:bool) => number) {',
        '  return param1;',
        '}'
      ]);
      eval(code);

      var callback = function(param) {
        return param ? 42 : 0;
      };
      expect(foo(callback)).toBe(callback);
      expect(bar(callback)).toBe(callback);
    });

    it('strips annotated params next to non-annotated params', function()  {
      var code = transform([
        'function foo(param1, param2: number) {',
        '  return [param1, param2];',
        '}',
        '',
        'var bar = function(param1, param2: number) {',
        '  return [param1, param2];',
        '}'
      ]);
      eval(code);
      expect(foo('p1', 42)).toEqual(['p1', 42]);
      expect(bar('p1', 42)).toEqual(['p1', 42]);
    });

    it('strips annotated params before a rest parameter', function()  {
      var code = transform([
        'function foo(param1: number, ...args) {',
        '  return [param1, args];',
        '}',
        '',
        'var bar = function(param1: number, ...args) {',
        '  return [param1, args];',
        '}'
      ]);
      eval(code);
      expect(foo(42, 43, 44)).toEqual([42, [43, 44]]);
      expect(bar(42, 43, 44)).toEqual([42, [43, 44]]);
    });

    it('strips annotated rest parameter', function()  {
      var code = transform([
        'function foo(param1: number, ...args: Array<number>) {',
        '  return [param1, args];',
        '}',
        '',
        'var bar = function(param1: number, ...args: Array<number>) {',
        '  return [param1, args];',
        '}'
      ]);
      eval(code);
      expect(foo(42, 43, 44)).toEqual([42, [43, 44]]);
      expect(bar(42, 43, 44)).toEqual([42, [43, 44]]);
    });

    it('strips optional param marker without type annotation', function()  {
      var code = transform([
        'function foo(param1?, param2 ?) {',
        '  return 42;',
        '}'
      ]);
      eval(code);
      expect(foo()).toBe(42);
    });

    it('strips optional param marker with type annotation', function()  {
      var code = transform([
        'function foo(param1?:number, param2 ?: string, param3 ? : bool) {',
        '  return 42;',
        '}'
      ]);
      eval(code);
      expect(foo()).toBe(42);
    });
  });

  describe('return type annotations', function()  {
    it('strips function return types', function()  {
      var code = transform([
        'function foo(param1:number): () => number {',
        '  return function() { return param1; };',
        '}',
        '',
        'var bar = function(param1:number): () => number {',
        '  return function() { return param1; };',
        '}'
      ]);
      eval(code);
      expect(foo(42)()).toBe(42);
      expect(bar(42)()).toBe(42);
    });

    it('strips void return types', function()  {
      var code = transform([
        'function foo(param1): void {',
        '  param1();',
        '}',
        '',
        'var bar = function(param1): void {',
        '  param1();',
        '}'
      ]);
      eval(code);

      var counter = 0;
      function testFn() {
        counter++;
      }

      foo(testFn);
      expect(counter).toBe(1);

      bar(testFn);
      expect(counter).toBe(2);
    });

    it('strips void return types with rest params', function()  {
      var code = transform( [
        'function foo(param1, ...rest): void {',
        '  param1();',
        '}',
        '',
        'var bar = function(param1, ...rest): void {',
        '  param1();',
        '}'
      ]);
      eval(code);

      var counter = 0;
      function testFn() {
        counter++;
      }

      foo(testFn);
      expect(counter).toBe(1);

      bar(testFn);
      expect(counter).toBe(2);
    });

    it('strips object return types', function()  {
      var code = transform([
        'function foo(param1:number): {num: number} {',
        '  return {num: param1};',
        '}',
        '',
        'var bar = function(param1:number): {num: number} {',
        '  return {num: param1};',
        '}'
      ]);

      eval(code);
      expect(foo(42)).toEqual({num: 42});
      expect(bar(42)).toEqual({num: 42});
    });
  });

  describe('parametric type annotation', function()  {
    it('strips parametric type annotations', function()  {
      var code = transform([
        'function foo<T>(param1) {',
        '  return param1;',
        '}',
        '',
        'var bar = function<T>(param1) {',
        '  return param1;',
        '}',
      ]);
      eval(code);
      expect(foo(42)).toBe(42);
      expect(bar(42)).toBe(42);
    });

    it('strips multi-parameter type annotations', function()  {
      var code = transform([
        'function foo<T, S>(param1) {',
        '  return param1;',
        '}',
        '',
        'var bar = function<T,S>(param1) {',
        '  return param1;',
        '}'
      ]);
      eval(code);
      expect(foo(42)).toBe(42);
      expect(bar(42)).toBe(42);
    });
  });

  describe('arrow functions', function()  {
    // TODO: We don't currently support arrow functions, but we should
    //       soon! The only reason we don't now is because we don't
    //       need it at this very moment and I'm in a rush to get the
    //       basics in.
  });
});
