const { sleep, Service, execAsync } = require('clean-scripts')

const elasticVersion = '5.5.2'

const tsFiles = `"src/**/*.ts" "spec/**/*.ts" "static/**/*.ts" "static_spec/**/*.ts" "test/**/*.ts" "screenshots/**/*.ts" "prerender/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`
const lessFiles = `"static/**/*.less"`

const schemaCommand = `types-as-schema src/types.ts --json static/ --protobuf static/protocol.proto`
const sqlCommand = `file2variable-cli src/sql/*.sql -o src/variables.ts --base src/sql`
const tscSrcCommand = `tsc -p src`
const templateCommand = `file2variable-cli static/*.template.html static/protocol.proto static/request-protocol.json static/response-protocol.json -o static/variables.ts --html-minify --json --protobuf --base static`
const tscStaticCommand = `tsc -p static`
const webpackCommand = `webpack --display-modules --config static/webpack.config.js`
const revStaticCommand = `rev-static --config static/rev-static.config.js`

module.exports = {
  build: [
    schemaCommand,
    {
      back: [
        sqlCommand,
        `rimraf dist/`,
        tscSrcCommand
      ],
      front: {
        js: [
          templateCommand,
          tscStaticCommand,
          webpackCommand
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
    revStaticCommand
  ],
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    less: `stylelint ${lessFiles}`,
    export: `no-unused-export ${tsFiles} ${lessFiles}`
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
      new Service(process.platform === 'win32'
        ? `.\\vendors\\elasticsearch-${elasticVersion}\\bin\\elasticsearch.bat`
        : `./vendors/elasticsearch-${elasticVersion}/bin/elasticsearch`),
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
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`,
    less: `stylelint --fix ${lessFiles}`
  },
  release: `clean-release`,
  watch: {
    schema: `${schemaCommand} --watch`,
    sql: `${sqlCommand} --watch`,
    back: `${tscSrcCommand} --watch`,
    template: `${templateCommand} --watch`,
    front: `${tscStaticCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    less: `watch-then-execute ${lessFiles} --script "clean-scripts build[1].front.css.index"`,
    rev: `${revStaticCommand} --watch`
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
