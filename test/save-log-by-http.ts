import fetch from 'node-fetch'

(async () => {
  const response = await fetch('http://localhost:8001/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
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
    })
  })
  const text = await response.text()
  if (text !== 'accepted') {
    console.log(text)
    throw new Error('Can not save by HTTP.')
  }
})()
