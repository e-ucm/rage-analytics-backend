/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union’s Horizon
 * 2020 research and innovation programme under grant agreement No 644187.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0 (link is external)
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

module.exports = function (grunt) {

    // Code adapted from http://stackoverflow.com/a/18402335/15472
    grunt.registerTask('default', function () {

        var counter = 0, fileExtension, commentWrapper;

        var header = grunt.file.read('HEADER').split('\n');
        var headerFirstLine = header[0];

        var headerJS = header.map(function (line, index, array) {
            if (index === 0) {
                return '/*\n' +
                    ' * ' + line;
            }
            if (index < array.length - 1) {
                return ' * ' + line;
            }
            return ' * ' + line + '\n' +
                ' */\n';

        }).join('\n');

        var headerHTML = header.map(function (line, index, array) {
            if (index === 0) {
                return '<!--\n' +
                    '  -- ' + line;
            }
            if (index < array.length - 1) {
                return '  -- ' + line;
            }
            return '  -- ' + line + '\n' +
                '  -->\n';

        }).join('\n');

        var dirPatterns = ['app/**', 'test/**', 'bin/**', '.'];
        var extensionPatterns = ['*.js', '*.jade', '*.html'];
        var patterns = [];
        dirPatterns.forEach(function (dir) {
            extensionPatterns.forEach(function (ext) {
                patterns.push(dir + '/' + ext);
            });
        });

        // Get file extension regex
        var re = /(?:\.([^.]+))?$/;

        grunt.log.writeln();

        // Read all subdirectories from your modules folder
        grunt.file.expand({filter: 'isFile'}, patterns)
            .forEach(function (dir) {
                var fileRead = grunt.file.read('./' + dir).split('\n');
                var secondLine = fileRead[1];

                if (secondLine.indexOf(headerFirstLine) === -1) {

                    counter++;
                    grunt.log.write(dir);
                    grunt.log.writeln(' -->doesn\'t have copyright. Writing it.');
                    grunt.log.writeln('    starts: \'' +
                        secondLine.substring(0, headerFirstLine.length) +
                        '\' ; did not find \'' + headerFirstLine + '\' in it');

                    // Need to be careful about:
                    // What kind of comment we can add to each type of file. i.e /* <text> */ to js
                    fileExtension = re.exec(dir)[1];
                    switch (fileExtension) {
                        case 'js': {
                            commentWrapper = headerJS;
                            break;
                        }
                        case 'html':
                        case 'jade': {
                            commentWrapper = headerHTML;
                            break;
                        }
                        default: {
                            commentWrapper = null;
                            grunt.log.writeln('file extension not recognized');
                            break;
                        }
                    }

                    if (commentWrapper) {
                        fileRead.unshift(commentWrapper);
                        fileRead = fileRead.join('\n');
                        grunt.file.write('./' + dir, fileRead);
                    }
                }
            });

        grunt.log.ok('Found', counter, 'files without copyright');
    });
};