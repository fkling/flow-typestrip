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

describe('static type pattern syntax', function() {
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

  describe('Object Pattern', function()  {
    it('strips function argument type annotation', function()  {
      var code = transform([
        'function foo({x, y}: {x: number; y: number}) { return x+y; }',
        'var thirty = foo({x: 10, y: 20});'
      ]);
      eval(code);
      expect(thirty).toBe(30);
    });
    it('strips var declaration type annotation', function()  {
      var code = transform([
        'var {x, y}: {x: number; y: string} = { x: 42, y: "hello" };'
      ]);
      eval(code);
      expect(x).toBe(42);
      expect(y).toBe("hello");
    });
  });

  describe('Array Pattern', function()  {
    it('strips function argument type annotation', function()  {
      var code = transform([
        'function foo([x, y]: Array<number>) { return x+y; }',
        'var thirty = foo([10, 20]);'
      ]);
      eval(code);
      expect(thirty).toBe(30);
    });
    it('strips var declaration type annotation', function()  {
      var code = transform([
        'var [x, y]: Array<number> = [42, "hello"];'
      ]);
      eval(code);
      expect(x).toBe(42);
      expect(y).toBe("hello");
    });
  });
});
