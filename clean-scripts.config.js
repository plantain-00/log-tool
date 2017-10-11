const childProcess = require('child_process')
const { sleep, Service } = require('clean-scripts')
const util = require('util')

const execAsync = util.promisify(childProcess.exec)

const elasticVersion = '5.5.2'

module.exports = {
  build: [
    `types-as-schema src/types.ts --json static/ --protobuf static/protocol.proto`,
    {
      back: [
        `file2variable-cli src/sql/*.sql -o src/variables.ts --base src/sql`,
        `rimraf dist/`,
        `tsc -p src`
      ],
      front: {
        js: [
          `file2variable-cli static/*.template.html static/protocol.proto static/request-protocol.json static/response-protocol.json -o static/variables.ts --html-minify --json --protobuf --base static`,
          `tsc -p static`,
          `webpack --display-modules --config static/webpack.config.js`
        ],
        css: {
          vendor: `cleancss ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/tab-container-component/tab-container.min.css -o ./static/vendor.bundle.css`,
          index: [
            `lessc ./static/index.less > ./static/index.css`,
            `postcss ./static/index.css -o ./static/index.postcss.css`,
            `cleancss ./static/index.postcss.css -o ./static/index.bundle.css`
          ]
        },
        clean: `rimraf static/*.bundle-*.js static/vendor.bundle-*.css static/index.bundle-*.css`
      }
    },
    `rev-static --config static/rev-static.config.js`
  ],
  lint: {
    ts: `tslint "src/**/*.ts" "static/**/*.ts"`,
    js: `standard "**/*.config.js"`,
    less: `stylelint "online/**/*.less"`,
    export: `no-unused-export "src/**/*.ts" "static/**/*.ts"`
  },
  test: {
    jasmine: [
      'tsc -p spec',
      'jasmine'
    ],
    karma: [
      'tsc -p static_spec',
      'karma start static_spec/karma.config.js'
    ],
    check: [
      'mkdirp vendors',
      `tsc -p test`,
      `node test/vendor.js`,
      new Service(`./vendors/elasticsearch-${elasticVersion}/bin/elasticsearch`),
      () => sleep(60000),
      new Service(`node ./dist/index.js`),
      () => sleep(10000),
      `node test/initialize.js`,
      () => sleep(5000),
      `node test/save-log-by-http.js`,
      () => sleep(5000),
      `node test/save-log-by-ws.js`,
      async () => {
        const { stdout } = await execAsync('git status -s')
        if (stdout) {
          console.log(stdout)
          throw new Error(`generated files doesn't match.`)
        }
      }
    ]
  },
  fix: {
    ts: `tslint --fix "src/**/*.ts" "static/**/*.ts"`,
    js: `standard --fix "**/*.config.js"`,
    less: `stylelint --fix "online/**/*.less"`
  },
  release: `clean-release`,
  watch: {
    schema: `watch-then-execute "src/types.ts" --script "clean-scripts build[0]"`,
    sql: `file2variable-cli src/sql/*.sql -o src/variables.ts --base src/sql --watch`,
    back: `tsc -p src --watch`,
    template: `file2variable-cli static/*.template.html static/protocol.proto static/request-protocol.json static/response-protocol.json -o static/variables.ts --html-minify --json --protobuf --base static --watch`,
    front: `tsc -p static --watch`,
    webpack: `webpack --config static/webpack.config.js --watch`,
    less: `watch-then-execute "./static/index.less" --script "clean-scripts build[1].front.css.index"`,
    rev: `rev-static --config static/rev-static.config.js --watch`
  },
  screenshot: [
    new Service(`node ./dist/index.js`),
    `tsc -p screenshots`,
    `node screenshots/index.js`
  ],
  prerender: [
    new Service(`node ./dist/index.js`),
    `tsc -p prerender`,
    `node prerender/index.js`,
    `clean-scripts build[2]`
  ]
}
