const childProcess = require('child_process')

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
      const server = childProcess.exec('node ./dist/index.js')
      server.stdout.pipe(process.stdout)
      server.stderr.pipe(process.stderr)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.waitFor(1000)
      await page.goto(`http://localhost:9000`)
      await page.waitFor(1000)
      await page.screenshot({ path: `static/screenshot.png`, fullPage: true })
      server.kill()
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
      'jasmine',
      'git checkout static/screenshot.png',
      () => new Promise((resolve, reject) => {
        childProcess.exec('git status -s', (error, stdout, stderr) => {
          if (error) {
            reject(error)
          } else {
            if (stdout) {
              reject(new Error(`generated files doesn't match.`))
            } else {
              resolve()
            }
          }
        }).stdout.pipe(process.stdout)
      })
    ],
    karma: [
      'tsc -p static_spec',
      process.env.APPVEYOR ? 'echo "skip karma test"' : 'karma start static_spec/karma.config.js'
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
      const server = childProcess.exec('node ./dist/index.js')
      server.stdout.pipe(process.stdout)
      server.stderr.pipe(process.stderr)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.waitFor(1000)
      await page.goto('http://localhost:9000')
      await page.waitFor(1000)
      const content = await page.evaluate(() => {
        const element = document.querySelector('#prerender-container')
        return element ? element.innerHTML : ''
      })
      fs.writeFileSync('static/prerender.html', content)
      server.kill()
      browser.close()
    },
    `clean-scripts build[2]`
  ]
}
