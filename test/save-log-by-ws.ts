import { sleep } from 'clean-scripts'
import WebSocket from 'ws'

(async() => {
  const ws = new WebSocket('http://localhost:8001/')
  ws.on('open', () => {
    ws.send(JSON.stringify({
      flows: [
        {
          kind: 'log',
          log: {
            time: '2010-10-10 01:01:01',
            content: 'Hello world',
            filepath: 'test.log',
            hostname: 'test'
          }
        }
      ]
    }), error => {
      if (error) {
        throw error
      }
    })
  })

  await sleep(5000)

  ws.close()
})()
