var dest = './build',
  src = './src',
  mui = './node_modules/material-ui/src';

module.exports = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + '/**'
    ]
  },
  less: {
    src: src + '/less/main.less',
    watch: [
      src + '/less/**',
      mui + '/less/**'
    ],
    dest: dest
  },
  markup: {
    src: src + "/www/**",
    dest: dest
  },
  dalliance: {
    build: {
      src: './dalliance/build/**',
      dest: dest + '/dalliance/build'
    },
    imgs: {
      src: './dalliance/imgs/**',
      dest: dest + '/dalliance/imgs'
    },
    fonts: {
      src: './dalliance/fonts/**',
      dest: dest + '/dalliance/fonts'
    },
    css: {
      src: './dalliance/css/**',
      dest: dest + '/dalliance/css'
    },
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/app/app.jsx',
      dest: dest,
      outputName: 'app.js'
    }]
  }
};
