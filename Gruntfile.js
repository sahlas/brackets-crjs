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
/*global module, require*/
module.exports = function (grunt) {
    'use strict';

    var common = require("./tasks/lib/common")(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg  : grunt.file.readJSON("package.json"),
        meta : {
            src   : [
                'src/**/*.js'
            ],
            test : [
                'tests/**/*.js'
            ],
            grunt: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],
            /* specs that can run in phantom.js */
            specs : [
                'tests/requirejs-crjs-test.spec.js'
            ]
        },
        watch: {
            test : {
                files: ['Gruntfile.js', '<%= meta.src %>', '<%= meta.test %>'],
                tasks: 'test'
            }
        },
        jasmine: {
              src: 'src/**/*.js',
              options: {
                specs: '<%= meta.specs %>',
                helpers: 'tests/*Helper.js',
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                  requireConfig: {
                    baseUrl: '../tests'
                  }
                }
              }
          },
        jshint: {
            test: [
       //         '<%= meta.test %>',
                '<%= meta.src %>'
            ],
         //   grunt: "<%= meta.grunt %>",
            /* use strict options to mimic JSLINT until we migrate to JSHINT in Brackets */
            options: {
                jshintrc: '.jshintrc'
            }
        },
        
    });

    // load dependencies
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // task: test
    grunt.registerTask('test', ['jshint', 'jasmine']);
    //grunt.registerTask('test', ['jshint']);

    // Default task.
    grunt.registerTask('default', ['test']);
};
