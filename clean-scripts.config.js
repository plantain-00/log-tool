module.exports = {
  build: [
    `rimraf dist/`,
    `rimraf static/*.bundle-*.js static/vendor.bundle-*.css static/index.bundle-*.css`,
    `types-as-schema src/types.ts --json static/ --protobuf static/protocol.proto`,
    `file2variable-cli static/*.template.html static/protocol.proto static/*-protocol.json -o static/variables.ts --html-minify --json --protobuf --base static`,
    `file2variable-cli src/sql/*.sql -o src/variables.ts --base src/sql`,
    `tsc -p src`,
    `tsc -p static`,
    `webpack --display-modules --config static/webpack.config.js`,
    `lessc ./static/index.less > ./static/index.css`,
    `cleancss ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/tab-container-component/dist/tab-container.min.css -o ./static/vendor.bundle.css`,
    `cleancss ./static/index.css -o ./static/index.bundle.css`,
    `rev-static --config static/rev-static.config.js`
  ],
  lint: [
    `tslint "src/*.ts" "static/*.ts"`,
    `standard "**/*.config.js"`,
    `stylelint "online/**/*.less"`
  ],
  test: [
    'tsc -p spec',
    'jasmine',
    'tsc -p static_spec',
    'karma start static_spec/karma.config.js'
  ],
  fix: [
    `standard --fix "**/*.config.js"`
  ],
  release: [
    `clean-release`
  ]
}
