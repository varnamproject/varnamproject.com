module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'browser/editor.js', 'browser/web.js'],
      options: {
        browser: true,
        globals: {
          jQuery: true,
          $: true,
          CodeMirror: true
        }
      }
    },
    uglify: {
      editor: {
        src: 'browser/editor.js',
        dest: 'tmp/editor-min.js'
      },
      web: {
        src: 'browser/web.js',
        dest: 'tmp/web-min.js'
      },
      codemirror_core: {
        src: 'browser/codemirror/codemirror.js',
        dest: 'tmp/codemirror-min.js'
      },
      codemirror_markdown: {
        src: 'browser/codemirror/markdown.js',
        dest: 'tmp/markdown-min.js'
      }
    },
    concat: {
      codemirror: {
        src: ['tmp/codemirror-min.js', 'tmp/markdown-min.js'],
        dest: 'tmp/codemirror-full-min.js'
      },
      web: {
        src: ['browser/deps/modernizr-2.6.2.min.js', 'browser/deps/showdown.min.js', 'browser/deps/bootstrap.min.js', 'tmp/codemirror-full-min.js', 'tmp/editor-min.js', 'tmp/web-min.js'],
        dest: 'public/javascripts/varnam.js'
      },
      addon: {
        src: ['tmp/codemirror-full-min.js', 'tmp/editor-min.js'],
        dest: 'public/javascripts/addon.js'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'uglify', 'concat']);
  grunt.registerTask('concatonly', ['jshint', 'concat']);

};
