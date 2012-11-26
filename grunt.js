module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'browser/editor.js', 'browser/web.js']
    },
    jshint: {
      options: {
        browser: true
      },
      globals: {
        jQuery: true,
        $: true,
        CodeMirror: true
      }
    },
    min: {
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
        src: ['tmp/codemirror-full-min.js', 'tmp/editor-min.js', 'tmp/web-min.js'],
        dest: 'public/javascripts/varnam.js'
      },
      addon: {
        src: ['tmp/codemirror-full-min.js', 'tmp/editor-min.js'],
        dest: 'public/javascripts/addon.js'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint min concat');
  grunt.registerTask('concatonly', 'lint concat');

};
