module.exports = function(grunt) {
    grunt.initConfig({

        watch: {
            scripts: {
                files: 'src/js/**/*.js',
                tasks: ['concat'],
                options: {
                    interrupt: true
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'build/start.js',
                    'src/js/diagram/shapes/EAttribute.shape.js',
                    'src/js/diagram/shapes/EOperation.shape.js',
                    'src/js/diagram/shapes/EClass.shape.js',
                    'src/js/diagram/EcoreDiagram.js',
                    'src/js/views/navigator/box.js',
                    'src/js/views/navigator/header.js',
                    'src/js/views/navigator/palette.js',
                    'src/js/views/navigator/resources.js',
                    'src/js/views/navigator/navigator.js',
                    'src/js/views/modals.js',
                    'src/js/views/property.js',
                    'src/js/views/editor.js',
                    'src/js/util/dnd.js',
                    'src/js/app.js',
                    'build/end.js'
                ],
                dest: 'scripts/app.js'
            }
        },

        less: {
            development: {
                options: {
                    compress: false
                },
                files: { 'css/app.css': 'src/less/**/*.less' }
            }
        },

         min: {
            dist: {
                src: ['scripts/app.js'],
                dest: 'scripts/app.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('build', 'concat min less');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
