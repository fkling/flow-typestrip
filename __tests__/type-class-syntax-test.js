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

describe('static type class syntax', function() {
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
        'class Foo {',
        '  method1(param1: bool) {',
        '    return param1;',
        '  }',
        '}',
        '',
        'var Bar = class {',
        '  method1(param1: bool) {',
        '    return param1;',
        '  }',
        '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42)).toBe(42);
      expect((new Bar()).method1(42)).toBe(42);
    });

    it('strips multiple param annotations', function()  {
      var code = transform([
        'class Foo {',
        '  method1(param1: bool, param2: number) {',
        '    return [param1, param2];',
        '  }',
        '}',
        '',
        'var Bar = class {',
        '  method1(param1: bool, param2: number) {',
        '    return [param1, param2];',
        '  }',
        '}'
      ]);
      eval(code);
      expect((new Foo()).method1(true, 42)).toEqual([true, 42]);
      expect((new Bar()).method1(true, 42)).toEqual([true, 42]);
    });

    it('strips higher-order param annotations', function()  {
      var code = transform([
        'class Foo {',
        '  method1(param1: (_:bool) => number) {',
        '    return param1;',
        '  }',
        '}',
        '',
        'var Bar = class {',
        '  method1(param1: (_:bool) => number) {',
        '    return param1;',
        '  }',
        '}'
      ]);
      eval(code);

      var callback = function(param) {
        return param ? 42 : 0;
      };
      expect((new Foo()).method1(callback)).toBe(callback);
      expect((new Bar()).method1(callback)).toBe(callback);
    });

    it('strips annotated params next to non-annotated params', function()  {
      var code = transform([
        'class Foo {',
        '  method1(param1, param2: number) {',
        '    return [param1, param2];',
        '  }',
        '}',
        '',
        'var Bar = class {',
        '  method1(param1, param2: number) {',
        '    return [param1, param2];',
        '  }',
        '}'
      ]);
      eval(code);
      expect((new Foo()).method1('p1', 42)).toEqual(['p1', 42]);
      expect((new Bar()).method1('p1', 42)).toEqual(['p1', 42]);
    });

    it('strips annotated params before a rest parameter', function()  {
      var code = transform([
        'class Foo {',
        '  method1(param1: number, ...args) {',
        '    return [param1, args];',
        '  }',
        '}',
        '',
        'var Bar = class {',
        '  method1(param1: number, ...args) {',
        '    return [param1, args];',
        '  }',
        '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42, 43, 44)).toEqual([42, [43, 44]]);
      expect((new Bar()).method1(42, 43, 44)).toEqual([42, [43, 44]]);
    });
  });

  describe('return type annotations', function()  {
    it('strips method return types', function()  {
      var code = transform([
        'class Foo {',
        '  method1(param1:number): () =>  number {',
        '    return function() { return param1; };',
        '  }',
        '}',
        '',
        'var Bar = class {',
        '  method1(param1:number): () =>  number {',
        '    return function() { return param1; };',
        '  }',
        '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42)()).toBe(42);
      expect((new Bar()).method1(42)()).toBe(42);
    });
  });

  describe('parametric type annotation', function()  {
    it('strips parametric class type annotations', function()  {
      var code = transform([
        'class Foo<T> {',
        '  method1(param1) {',
        '    return param1;',
        '  }',
        '}',
        '',
        // TODO: Need to add support to esprima for this
        // 'var Bar = class<T> {',
        // '  method1(param1) {',
        // '    return param1;',
        // '  }',
        // '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42)).toBe(42);
      // expect((new Bar()).method1(42)).toBe(42);
    });

    it('strips multi-parameter class type annotations', function()  {
      var code = transform([
        'class Foo<T,S> {',
        '  method1(param1) {',
        '    return param1;',
        '  }',
        '}',
        '',
        // TODO: Need to add support to esprima for this
        // 'var Bar = class<T> {',
        // '  method1(param1) {',
        // '    return param1;',
        // '  }',
        // '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42)).toBe(42);
      // expect(bar(42)).toBe(42);
    });

    it('strips parametric method type annotations', function()  {
      var code = transform([
        'class Foo<T> {',
        '  method1<T>(param1) {',
        '    return param1;',
        '  }',
        '}',
        '',
        // TODO: Need to add support to esprima for this
        // 'var Bar = class<T> {',
        // '  method1<T>(param1) {',
        // '    return param1;',
        // '  }',
        // '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42)).toBe(42);
      // expect((new Bar()).method1(42)).toBe(42);
    });

    it('strips multi-parameter class type annotations', function()  {
      var code = transform([
        'class Foo<T,S> {',
        '  method1<T,S>(param1) {',
        '    return param1;',
        '  }',
        '}',
        '',
        // TODO: Need to add support to esprima for this
        // 'var Bar = class<T> {',
        // '  method1(param1) {',
        // '    return param1;',
        // '  }',
        // '}'
      ]);
      eval(code);
      expect((new Foo()).method1(42)).toBe(42);
      // expect(bar(42)).toBe(42);
    });
  });

  describe('class property annotations', function()  {
    it('strips single class property', function()  {
      var code = transform([
        'class Foo {',
        '  prop1: T;',
        '}'
      ]);
      eval(code);
      expect((new Foo()).prop1).toEqual(undefined);
    });

    it('strips multiple adjacent class properties', function()  {
      var code = transform([
        'class Foo {',
        '  prop1: T;',
        '  prop2: U;',
        '}'
      ]);
      eval(code);
      expect((new Foo()).prop1).toEqual(undefined);
      expect((new Foo()).prop2).toEqual(undefined);
    });

    it('strips class properties between methods', function()  {
      var code = transform([
        'class Foo {',
        '  method1() {}',
        '  prop1: T;',
        '  method2() {}',
        '  prop2: U;',
        '  method3() {}',
        '}'
      ]);
      eval(code);
      expect((new Foo()).prop1).toEqual(undefined);
      expect((new Foo()).prop2).toEqual(undefined);
    });
  });
});
