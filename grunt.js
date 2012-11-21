module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'browser/*.js']
    },
    jshint: {
      options: {
        browser: true
      }
    },
    concat: {
      dist: {
        src: ['browser/*.js'],
        dest: 'public/javascripts/varnam.js'
      }
    },
    min: {
      dist: {
        src: 'public/javascripts/varnam.js',
        dest: 'public/javascripts/varnam.js'
      },
      addon: {
        src: 'browser/editor.js',
        dest: 'public/javascripts/addon.js'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');
  grunt.registerTask('concatonly', 'lint concat');

};
