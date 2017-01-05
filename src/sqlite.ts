import * as libs from "./libs";
import * as types from "./types";
import * as config from "./config";

let db: libs.sqlite3.Database;

export function start() {
    db = new libs.sqlite3.Database(config.sqlite.filePath, error => {
        if (error) {
            libs.publishError(error);
        } else {
            createTablesIfNotExists();
        }
    });
    if (config.sqlite.samples) {
        libs.sampleSubject.bufferTime(1000)
            .filter(s => s.length > 0)
            .subscribe(samples => {
                const time = Math.round(Date.now() / 1000);
                db.run("INSERT INTO samples (time, value) values (?, ?)", [time, JSON.stringify(samples)], error => {
                    if (error) {
                        libs.publishError(error);
                    }
                });
            });
    }
}

function createTablesIfNotExists() {
    // this table is used to store sample
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = 'samples'", [], (error, row) => {
        if (error) {
            libs.publishError(error);
        } else {
            const exists = row.count > 0;
            if (!exists) {
                db.run("CREATE TABLE samples (time, value)", creationError => {
                    if (creationError) {
                        libs.publishError(creationError);
                    }
                });
            }
        }
    });
    // this table is used to store logs that cannot be sent out by outflow
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = 'outflow_logs'", [], (error, row) => {
        if (error) {
            libs.publishError(error);
        } else {
            const exists = row.count > 0;
            if (!exists) {
                db.run("CREATE TABLE outflow_logs (value)", creationError => {
                    if (creationError) {
                        libs.publishError(creationError);
                    }
                });
            }
        }
    });
    // this table is used to store logs that cannot be stored into elastic search
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = 'elastic_logs'", [], (error, row) => {
        if (error) {
            libs.publishError(error);
        } else {
            const exists = row.count > 0;
            if (!exists) {
                db.run("CREATE TABLE elastic_logs (value)", creationError => {
                    if (creationError) {
                        libs.publishError(creationError);
                    }
                });
            }
        }
    });
}

export function querySamples(from: number, to: number, next: (sampleFrames: types.SampleFrame[]) => void) {
    db.all("SELECT time, value from samples WHERE time >= ? and time <= ? ORDER BY time ASC", [from, to], (error, rows: { time: number, value: string }[]) => {
        if (error) {
            libs.publishError(error);
        } else {
            next(rows.map(r => {
                return {
                    time: libs.moment(r.time * 1000).format("YYYY-MM-DD HH:mm:ss"),
                    samples: JSON.parse(r.value) as types.Sample[],
                };
            }));
        }
    });
}

export function saveOutflowLog(log: string | Uint8Array) {
    db.run("INSERT INTO outflow_logs (value) values (?)", [log], error => {
        if (error) {
            libs.publishError(error);
        }
    });
}

export function queryAllOutflowLogs(next: (rows: { ROWID: number, value: string | Uint8Array }[]) => void) {
    db.all("SELECT ROWID, value from outflow_logs", [], (error, rows) => {
        if (error) {
            libs.publishError(error);
        } else {
            next(rows);
        }
    });
}

export function deleteSuccessfulOutflowLog(rowid: number) {
    db.run("DELETE FROM outflow_logs WHERE ROWID = ?", [rowid], error => {
        if (error) {
            libs.publishError(error);
        }
    });
}

export function saveElasticLog(log: types.Log) {
    db.run("INSERT INTO elastic_logs (value) values (?)", [JSON.stringify(log)], error => {
        if (error) {
            libs.publishError(error);
        }
    });
}

export function queryAllElasticLogs(next: (rows: { ROWID: number, value: string }[]) => void) {
    db.all("SELECT ROWID, value from elastic_logs", [], (error, rows) => {
        if (error) {
            libs.publishError(error);
        } else {
            next(rows);
        }
    });
}

export function deleteSuccessfulElasticLog(rowid: number) {
    db.run("DELETE FROM elastic_logs WHERE ROWID = ?", [rowid], error => {
        if (error) {
            libs.publishError(error);
        }
    });
}
