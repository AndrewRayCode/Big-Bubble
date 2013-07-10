module.exports = function(grunt) {

    grunt.initConfig({
        sass: {
            dist: {
                files: {
                    'css/main.css': 'sass/main.scss'
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    'sass/*.scss'
                ],
                tasks: [ 'sass' ]
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.registerTask( 'default', [ 'sass' ] );
};
