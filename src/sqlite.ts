import * as libs from './libs'
import * as types from './types'
import * as config from './config'
import * as sql from './variables'

let db: libs.sqlite3.Database

export function start() {
  db = new libs.sqlite3.Database(config.sqlite.filePath, error => {
    if (error) {
      libs.publishError(error)
    } else {
      createTablesIfNotExists()
    }
  })
  if (config.sqlite.samples) {
    libs.bufferedSampleSubject.subscribe(samples => {
      const time = Math.round(Date.now() / 1000)
      db.run(sql.saveSampleSql, [time, JSON.stringify(samples)], dbErrorCallback)
    })
  }
}

function createTablesIfNotExists() {
  // this table is used to store sample
  db.get(sql.queryTableSamplesExistsSql, [], (error, row) => {
    if (error) {
      libs.publishError(error)
    } else {
      const exists = row.count > 0
      if (!exists) {
        db.run(sql.createTableSampleSql, creationError => {
          if (creationError) {
            libs.publishError(creationError)
          }
        })
      }
    }
  })
  // this table is used to store logs that cannot be sent out by outflow
  db.get(sql.queryTableOutflowLogsExistsSql, [], (error, row) => {
    if (error) {
      libs.publishError(error)
    } else {
      const exists = row.count > 0
      if (!exists) {
        db.run(sql.createTableOutflowLogsSql, dbErrorCallback)
      }
    }
  })
  // this table is used to store logs that cannot be stored into elastic search
  db.get(sql.queryTableElasticLogsExistsSql, [], (error, row) => {
    if (error) {
      libs.publishError(error)
    } else {
      const exists = row.count > 0
      if (!exists) {
        db.run(sql.createTableElasticLogsSql, dbErrorCallback)
      }
    }
  })
}

function dbErrorCallback(error: Error) {
  if (error) {
    libs.publishError(error)
  }
}

export function querySamples(from: number, to: number) {
  return new Promise<types.SampleFrame[]>((resolve, reject) => {
    db.all(sql.querySamplesSql, [from, to], (error, rows: { time: number, value: string }[]) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows.map(r => {
          return {
            time: libs.moment(r.time * 1000).format('YYYY-MM-DD HH:mm:ss'),
            samples: JSON.parse(r.value)
          }
        }))
      }
    })
  })
}

export function saveOutflowLog(log: string | Uint8Array) {
  db.run(sql.saveOutflowLogsSql, [log], dbErrorCallback)
}

export function queryAllOutflowLogs(next: (rows: { ROWID: number, value: string | Uint8Array }[]) => void) {
  db.all(sql.queryOutflowLogsSql, [], (error, rows) => {
    if (error) {
      libs.publishError(error)
    } else {
      next(rows)
    }
  })
}

export function deleteSuccessfulOutflowLog(rowid: number) {
  db.run(sql.deleteOutflowLogsSql, [rowid], dbErrorCallback)
}

export function saveElasticLog(log: types.Log) {
  db.run(sql.saveElasticLogsSql, [JSON.stringify(log)], dbErrorCallback)
}

export function queryAllElasticLogs() {
  return new Promise<{ ROWID: number, value: string }[]>((resolve, reject) => {
    db.all(sql.queryElasticLogsSql, [], (error, rows) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows)
      }
    })
  })
}

export function deleteSuccessfulElasticLog(rowid: number) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql.deleteElasticLogsSql, [rowid], error => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
