const childProcess = require('child_process')
const { sleep } = require('clean-scripts')
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
            `cleancss ./static/index.css -o ./static/index.bundle.css`
          ]
        },
        clean: `rimraf static/*.bundle-*.js static/vendor.bundle-*.css static/index.bundle-*.css`
      }
    },
    `rev-static --config static/rev-static.config.js`,
    async () => {
      const puppeteer = require('puppeteer')
      const fs = require('fs')
      const beautify = require('js-beautify').html
      const server = childProcess.spawn('node', ['./dist/index.js'])
      server.stdout.pipe(process.stdout)
      server.stderr.pipe(process.stderr)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
      await page.waitFor(1000)
      await page.goto(`http://localhost:9000`)
      await page.waitFor(1000)
      await page.screenshot({ path: `static/screenshot.png`, fullPage: true })
      const content = await page.content()
      fs.writeFileSync(`static/screenshot-src.html`, beautify(content))
      server.kill('SIGINT')
      browser.close()
    }
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
      () => new Promise((resolve, reject) => {
        const https = require('https')
        const fs = require('fs')
        const decompress = require('decompress')
        const req = https.request(`https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${elasticVersion}.zip`, res => {
          const contentLength = res.headers['content-length']
          let size = 0
          res.on('data', d => {
            size += d.length
            console.log((size * 100.0 / contentLength).toFixed(1) + ' % ' + size)
          })
          res.pipe(fs.createWriteStream(`vendors/elasticsearch-${elasticVersion}.zip`))
          res.on('end', () => {
            decompress(`vendors/elasticsearch-${elasticVersion}.zip`, 'vendors').then(files => {
              resolve()
            })
          })
        })
        req.end()
      }),
      async () => {
        const elasticsearch = childProcess.spawn(`./vendors/elasticsearch-${elasticVersion}/bin/elasticsearch`)
        elasticsearch.stdout.pipe(process.stdout)
        elasticsearch.stderr.pipe(process.stderr)
        await sleep(30000)
        const http = require('http')
        const req = http.request({
          method: 'PUT',
          port: 9200,
          path: '/tool'
        })
        req.write(`{
          "mappings" : {
            "logs" : {
              "properties" : {
                "time": {
                  "type": "date", 
                  "format": "yyyy-MM-dd HH:mm:ss"
                },
                "content": {
                  "type": "string"
                },
                "filepath": {
                  "type": "string"
                },
                "hostname": {
                  "type": "string"
                }
              }
            }
          }
        }`)
        req.end()

        await sleep(5000)
        elasticsearch.kill('SIGINT')
      },
      'git checkout static/screenshot.png',
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
  prerender: [
    async () => {
      const puppeteer = require('puppeteer')
      const fs = require('fs')
      const server = childProcess.spawn('node', ['./dist/index.js'])
      server.stdout.pipe(process.stdout)
      server.stderr.pipe(process.stderr)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
      await page.waitFor(1000)
      await page.goto('http://localhost:9000')
      await page.waitFor(1000)
      const content = await page.evaluate(() => {
        const element = document.querySelector('#prerender-container')
        return element ? element.innerHTML : ''
      })
      fs.writeFileSync('static/prerender.html', content)
      server.kill('SIGINT')
      browser.close()
    },
    `clean-scripts build[2]`
  ]
}
