module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            // define the files to lint
            files: ['gruntfile.js', '*.js', 'utils/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'test/**/*.js'],

            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        }
    });

    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-qunit');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('test', ['jshint' /*, 'qunit'*/]);

    grunt.registerTask('default', ['jshint' /*, 'qunit', 'concat', 'uglify'*/]);
};

