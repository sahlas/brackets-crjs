/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, node: true, nomen: true,
indent: 4, maxerr: 50 */
/*global exports, expect, describe, it */

"use strict";

var CRJSDomain  = require("../node/ComplexityReportDomain.js");
var fs          = require("fs");

describe("Asynchronous ComplexityReportDomain specs with default options", function() {
  var value, flag, _result;

  it("should return a 'report' from complexityReport.js", function() {

    runs(function() {
      flag = false;
      value = 0;
      _result = "";

        
      setTimeout(function() {
        flag = true;
      }, 500);
    });

      waitsFor(function() {
        fs.readFile('00/ForTesting.js','utf8', function (err, data) {
            if(data) {
                _result = CRJSDomain.cmdGetComplexityReport(data, null);
            }
            if (err) {
              throw err;
            } 
        });
      return flag;
    }, "The result should be a new report from calling into the ComplexityReportDomain.cmdGetComplexityReport method", 750);

    runs(function() {
        var report = _result.report;
        expect(Number(report.maintainability.toFixed(2))).toEqual(120.97);
        expect(report.aggregate.complexity.sloc.physical).toEqual(343);
        expect(report.aggregate.complexity.sloc.logical).toEqual(192);
        expect(report.aggregate.complexity.cyclomatic).toEqual(31);
    });
  });
});

describe("Asynchronous ComplexityReportDomain specs with non-default options", function() {
  var value, flag, _result;
  var options = {"logicalor": false, "switchcase":false , "forin": true, "trycatch": true}

  it("should return a 'report' from complexityReport.js", function() {

    runs(function() {
      flag = false;
      value = 0;
      _result = "";

        
      setTimeout(function() {
        flag = true;
      }, 500);
    });

      waitsFor(function() {
        fs.readFile('00/ForTesting.js','utf8', function (err, data) {
            if(data) {
                _result = CRJSDomain.cmdGetComplexityReport(data, options);
            }
            if (err) {
              throw err;
            } 
        });
      return flag;
    }, "The result should be a new report from calling into the ComplexityReportDomain.cmdGetComplexityReport method", 750);

    runs(function() {
        var report = _result.report;
        expect(Number(report.maintainability.toFixed(2))).toEqual(120.98);
        expect(report.aggregate.complexity.sloc.physical).toEqual(343);
        expect(report.aggregate.complexity.sloc.logical).toEqual(192);
        expect(report.aggregate.complexity.cyclomatic).toEqual(29);
    });
  });
});















