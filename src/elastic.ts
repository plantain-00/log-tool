import * as libs from "./libs";
import * as config from "./config";
import * as types from "./types";
import * as sqlite from "./sqlite";

export function start() {
    if (!config.elastic.enabled) {
        return;
    }

    libs.logSubject.subscribe(log => {
        libs.fetch(config.elastic.url, {
            method: "POST",
            body: JSON.stringify(log),
            headers: { "Content-Type": "application/json" },
        }).catch(error => {
            libs.publishError(error);
            sqlite.saveElasticLog(log);
        });
    });
}

export async function search(q: string, from: number, size: number): Promise<types.SearchLogsResult> {
    const response = await libs.fetch(`${config.elastic.url}/_search?q=${q}&from=${from}&size=${size}&sort=time:desc`);
    const json: {
        hits: {
            total: number;
            hits: { _source: types.Log }[];
        };
    } = await response.json();
    return {
        total: json.hits.total,
        logs: json.hits.hits.map(s => s._source),
    };
}

export function resaveFailedLogs() {
    sqlite.queryAllElasticLogs(rows => {
        for (const row of rows) {
            libs.fetch(config.elastic.url, {
                method: "POST",
                body: row.value,
                headers: { "Content-Type": "application/json" },
            }).then(response => {
                sqlite.deleteSuccessfulElasticLog(row.ROWID);
            }, error => {
                libs.publishError(error);
            });
        }
    });
}
