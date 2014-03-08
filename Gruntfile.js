'use strict';

module.exports = function (grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var base = 'cosinnus_todo/static/';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                livereload: true
            },
            livereload: {
                files: ['**/*.html', '**/*.js']
            },
            sass: {
                files: '**/*.s[ac]ss',
                tasks: ['sass:dev']
            }
        },
        sass: {                              // Task
            dev: {                             // Another target
                options: {                       // Target options
                    style: 'expanded',
                    trace: true
                    /* lineNumbers: true */
                },
                files: {
                    'cosinnus_todo/static/css/cosinnus_todo.css': base + '/sass/main.scss',
                    'cosinnus_todo/static/css/bootstrap3-neww-todo.css': base + '/sass/vendor/bootstrap/bootstrap.scss'
                }
            }
        },
        browser_sync: {
            dev: {
                bsFiles: {
                    src : [
                        base + 'css/cosinnus_todo.css',
                        'cosinnus_todo/templates/cosinnus_todo/*.html',
                    ]
                },
                options: {
                    watchTask: true,
                    ghostMode: {
                        clicks: true,
                        scroll: true,
                        links: true,
                        forms: true
                    }
                }
            }
        }
    });

    grunt.registerTask('default', [
        'sass', 'browser_sync', 'watch'
    ]);
};
