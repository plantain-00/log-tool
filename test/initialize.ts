import fetch from 'node-fetch'

(async () => {
  const response = await fetch('http://localhost:9200/tool', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mappings: {
        logs: {
          properties: {
            time: {
              type: 'date',
              format: 'yyyy-MM-dd HH:mm:ss'
            },
            content: {
              type: 'string'
            },
            filepath: {
              type: 'string'
            },
            hostname: {
              type: 'string'
            }
          }
        }
      }
    })
  })
  console.log(await response.text())
})()
