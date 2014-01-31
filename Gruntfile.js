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
                files: ['**/*.html', '**/*.css', '**/*.js']
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
                    'cosinnus_todo/static/css/cosinnus_todo.css': base + '/sass/main.scss'
                    //'forum/static/forum/css/main.css': 'forum/' + base + '/forum/sass/main.scss',
                }
            }
        }
    });
    grunt.registerTask('default', [
        'sass', 'watch'
    ]);
};
