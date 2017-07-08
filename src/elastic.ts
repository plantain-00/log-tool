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

export async function search(content: string, time: string, hostname: string, from: number, size: number): Promise<types.SearchLogsResult> {
    const response = await libs.fetch(`${config.elastic.url}/_search`, {
        method: "POST",
        body: JSON.stringify({
            from,
            size,
            sort: [{ time: "desc" }],
            query: {
                query_string: {
                    query: `content:${content} AND time:${time} AND hostname:${hostname}`,
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
        total: json.hits.total,
        logs: json.hits.hits.map(s => s._source),
    };
}

export async function resaveFailedLogs() {
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
        savedCount: count,
        totalCount: rows.length,
    };
}
