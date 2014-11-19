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

describe('static type interface syntax', function() {
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

  describe('Interface Declaration', function()  {
    it('strips interface declarations', function()  {
      /* TODO: Depends on support of InterfaceDeclartion nodes in ast-types
      var code = transform([
        'var interface = 42;',
        'interface A { foo: () => number; }',
        'if (true) interface += 42;',
        'interface A<T> extends B, C<T> { foo: () => number; }',
        'interface += 42;'
      ]);
      eval(code);
      expect(interface).toBe(126);
      */
    });
  });
});
