module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            options: {
                stripBanners: true
            },
            js: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/angular/angular.min.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/angular-facebook/lib/angular-facebook.js',
                    'build/_app.min.js'],
                dest: 'build/app.min.js'
            },
            css: {
                src: [
                    'bower_components/bootstrap/dist/css/bootstrap.min.css',
                    'bower_components/font-awesome/css/font-awesome.min.css',
                    'bower_components/font-awesome/font-awesome.min.css',
                    'build/_app.min.css'],
                dest: 'build/app.min.css'
            }
        },
        uglify: {
            build: {
                files: {
                    'build/_app.min.js': ['src/js/app.js']
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'build/_app.min.css': ['src/css/app.css']
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['fonts/**'],
                        cwd: 'bower_components/bootstrap/dist/',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        src: ['fonts/**'],
                        cwd: 'bower_components/font-awesome/',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        src: ['app.min.js'],
                        cwd: 'build',
                        dest: 'dist/js'
                    },
                    {
                        expand: true,
                        cwd: 'build',
                        src: ['app.min.css'],
                        dest: 'dist/css'
                    },
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['index.html'],
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        cwd: 'src/img',
                        src: ['*'],
                        dest: 'dist/img'
                    }
                ]
            }
        },
        clean: {
            build: ['build','tmp','dist']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('build',['clean:build','uglify','cssmin','concat','copy'])
};
