import fs = require('fs')
import YAML = require('json2yaml')

const slice = Array.prototype.slice
const LOG_FILENAME = 'pnpm-debug.log'

export default function (streamParser: Object) {
  const logs: Object[] = []

  streamParser['on']('data', function (logObj: Object) {
    if (isUsefulLog(logObj)) {
      logs.push(logObj)
    }
  })

  process.on('exit', (code: number) => {
    if (code === 0) {
      // it might not exist, so it is OK if it fails
      try {
        fs.unlinkSync(LOG_FILENAME)
      } catch (err) {}
      return
    }

    const yamlLogs = YAML.stringify(logs)
    fs.writeFileSync(LOG_FILENAME, yamlLogs, 'UTF8')
  })

  function getPrettyLogs () {
    const prettyLogs = {}
    logs.forEach((logObj, i) => {
      const key = `${i} ${logObj['time']} ${logObj['level']} ${logObj['name']}`
      const msgobj = getMessageObj(logObj)
      const rest = stringify(msgobj)
      prettyLogs[key] = rest.length === 1 ? rest[0] : rest
    })
    return prettyLogs
  }

  function getMessageObj (logobj: Object): Object {
    const msgobj = {}
    for (let key in logobj) {
      if (['time', 'hostname', 'pid', 'level', 'name'].indexOf(key) !== -1) continue
      msgobj[key] = logobj[key]
    }
    return msgobj
  }

  function stringify (obj: Object): string {
    if (obj instanceof Error) {
      let logMsg = obj.toString()
      if (obj.stack) {
        logMsg += `\n${obj.stack}`
      }
      return logMsg
    }
    return obj.toString()
  }
}

function isUsefulLog (logObj: Object) {
  return logObj['name'] !== 'pnpm:progress' || logObj['status'] !== 'downloading'
}
