var clientJS = ['./js/**', '!./js/__tests__/**'];

module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      options: {
        transform: ['reactify'],
      },
      dev: {
        src: ['./js/**'],
        dest: './assets/app.js',
        options: {
          bundleOptions: {
            debug: true
          }
        }
      }
    },
    express: {
      dev: {
        options: {
          background: false,
          script: "./server.js"
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.registerTask('default', ['browserify', 'express']);
};
