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

export async function search(parameters: types.SearchLogs, requestId: number): Promise<types.SearchLogsResult> {
    const response = await libs.fetch(`${config.elastic.url}/_search`, {
        method: "POST",
        body: JSON.stringify({
            from: parameters.from,
            size: parameters.size,
            sort: [{ time: "desc" }],
            query: {
                query_string: {
                    query: `content:${parameters} AND time:${parameters.time} AND hostname:${parameters.hostname}`,
                },
            },
        }),
    });
    const json: {
        hits: {
            total: number;
            hits: { _source: types.Log }[];
        };
    } = await response.json();
    return {
        kind: types.ResultKind.success,
        total: json.hits.total,
        logs: json.hits.hits.map(s => s._source),
        requestId,
    };
}

export async function resaveFailedLogs(requestId: number): Promise<types.ResaveFailedLogsResult> {
    const rows = await sqlite.queryAllElasticLogs();
    let count = 0;
    for (const row of rows) {
        const response = await libs.fetch(config.elastic.url, {
            method: "POST",
            body: row.value,
            headers: { "Content-Type": "application/json" },
        });
        if (response.status < 300) {
            await sqlite.deleteSuccessfulElasticLog(row.ROWID);
            count++;
        }
    }
    return {
        kind: types.ResultKind.success,
        requestId,
        savedCount: count,
        totalCount: rows.length,
    };
}
