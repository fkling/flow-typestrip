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

describe('static type object-method syntax', function() {
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
        'var foo = {',
        '  bar(param1: bool) {',
        '    return param1;',
        '  }',
        '};',
      ]);
      eval(code);
      expect(foo.bar(42)).toBe(42);
    });

    it('strips multiple param annotations', function()  {
      var code = transform([
        'var foo = {',
        '  bar(param1: bool, param2: number) {',
        '    return [param1, param2];',
        '  }',
        '};'
      ]);
      eval(code);
      expect(foo.bar(true, 42)).toEqual([true, 42]);
    });

    it('strips higher-order param annotations', function()  {
      var code = transform([
        'var foo = {',
        '  bar(param1: (_:bool) => number) {',
        '    return param1;',
        '  }',
        '};'
      ]);
      eval(code);

      var callback = function(param) {
        return param ? 42 : 0;
      };
      expect(foo.bar(callback)).toBe(callback);
    });

    it('strips annotated params next to non-annotated params', function()  {
      var code = transform([
        'var foo = {',
        '  bar(param1, param2: number) {',
        '    return [param1, param2];',
        '  }',
        '}',
      ]);
      eval(code);
      expect(foo.bar('p1', 42)).toEqual(['p1', 42]);
    });

    it('strips annotated params before a rest parameter', function()  {
      var code = transform([
        'var foo = {',
        '  bar(param1: number, ...args) {',
        '    return [param1, args];',
        '  }',
        '}',
      ]);
      eval(code);
      expect(foo.bar(42, 43, 44)).toEqual([42, [43, 44]]);
    });

    it('strips annotated rest parameter', function()  {
      var code = transform([
        'var foo = {',
        '  bar(param1: number, ...args: Array<number>): Array<any> {',
        '    return [param1, args];',
        '  }',
        '}',
      ]);
      eval(code);
      expect(foo.bar(42, 43, 44)).toEqual([42, [43, 44]]);
    });
  });

  describe('return type annotations', function()  {
    it('strips function return types', function()  {
      var code = transform([
        'var foo = {',
        '  bar(param1:number): () => number {',
        '    return function() { return param1; };',
        '  }',
        '}',
      ]);
      eval(code);
      expect(foo.bar(42)()).toBe(42);
    });
  });

  describe('parametric type annotation', function()  {
    // TODO: Fix esprima parsing for these cases
    /*
    it('strips parametric type annotations', function()  {
      // TODO: Doesnt parse
      var code = transform([
        'var foo = {',
        '  bar<T>(param1) {',
        '    return param1;',
        '  }',
        '}',
      ]);
      eval(code);
      expect(foo.bar(42)).toBe(42);
    });

    it('strips multi-parameter type annotations', function()  {
      // TODO: Doesnt parse
      var code = transform([
        'var foo = {',
        '  bar<T, S>(param1) {',
        '    return param1;',
        '  }',
        '}',
      ]):
      eval(code);
      expect(foo.bar(42)).toBe(42);
    });
    */
  });
});
