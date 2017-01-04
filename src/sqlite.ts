import * as libs from "./libs";
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
}

export function querySamples(from: number, to: number, next: (rows: { time: number:value: string }[]) => void) {
    db.all("SELECT * from samples WHERE time >= ? and time <= ?", [from, to], (error, rows) => {
        if (error) {
            libs.publishError(error);
        } else {
            next(rows);
        }
    });
}
