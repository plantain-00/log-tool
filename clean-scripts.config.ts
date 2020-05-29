import { sleep, Service, executeScriptAsync } from 'clean-scripts'
import { watch } from 'watch-then-execute'

const elasticVersion = '5.5.2'

const tsFiles = `"src/**/*.ts" "static/**/*.ts" "test/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js"`
const lessFiles = `"static/**/*.less"`

const schemaCommand = `types-as-schema src/types.ts --json static/ --protobuf static/protocol.proto`
const sqlCommand = `file2variable-cli src/sql/*.sql -o src/variables.ts --base src/sql`
const tscSrcCommand = `tsc -p src`
const templateCommand = `file2variable-cli --config static/file2variable.config.ts`
const webpackCommand = `webpack --config static/webpack.config.ts`
const revStaticCommand = `rev-static --config static/rev-static.config.ts`
const cssCommand = [
  `lessc ./static/index.less > ./static/index.css`,
  `postcss ./static/index.css -o ./static/index.postcss.css`,
  `cleancss ./static/index.postcss.css -o ./static/index.bundle.css`
]

export default {
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
          webpackCommand
        ],
        css: {
          vendor: `cleancss ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/tab-container-component/dist/tab-container.min.css -o ./static/vendor.bundle.css`,
          index: cssCommand
        },
        clean: `rimraf static/*.bundle-*.js static/vendor.bundle-*.css static/index.bundle-*.css`
      }
    },
    revStaticCommand
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles}`,
    less: `stylelint ${lessFiles}`,
    export: `no-unused-export ${tsFiles} ${lessFiles}`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict',
    typeCoverageStatic: 'type-coverage -p static --strict'
  },
  test: {
    // start: new Program('clean-release --config clean-run.config.ts', 30000),
    check: [
      'mkdirp vendors',
      `ts-node test/vendor.ts`,
      new Service(process.platform === 'win32'
        ? `.\\vendors\\elasticsearch-${elasticVersion}\\bin\\elasticsearch.bat`
        : `./vendors/elasticsearch-${elasticVersion}/bin/elasticsearch`),
      () => sleep(60000),
      new Service(`node ./dist/index.js`),
      () => sleep(10000),
      `ts-node test/initialize.ts`,
      () => sleep(5000),
      `ts-node test/save-log-by-http.ts`,
      () => sleep(5000),
      `ts-node test/save-log-by-ws.ts`
    ]
  },
  fix: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles} --fix`,
    less: `stylelint --fix ${lessFiles}`
  },
  watch: {
    schema: `${schemaCommand} --watch`,
    sql: `${sqlCommand} --watch`,
    back: `${tscSrcCommand} --watch`,
    template: `${templateCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    less: () => watch(['static/**/*.less'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`
  }
}
