import * as libs from "./libs";
import * as config from "./config";
import * as types from "./types";

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
            libs.errorSubject.next(error);
        });
    });
}

export async function search(q: string, from: number, size: number): Promise<types.SearchLogsResult> {
    const response = await libs.fetch(`${config.elastic.url}/_search?q=${q}&from=${from}&size=${size}`);
    return await response.json();
}
