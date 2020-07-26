const { readFileSync, createWriteStream } = require('fs')
const { resolve } = require('path')

const data = JSON.parse(readFileSync(resolve(__dirname, 'data', 'events.json')).toString())
const output = createWriteStream(resolve(__dirname, 'data', 'events-0.json'))
data.forEach(entry => {
  output.write(JSON.stringify(entry) + '\n')
})
output.end()
