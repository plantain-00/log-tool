import * as libs from "./libs";
import * as config from "./config";
import * as types from "./types";

export function start() {
    if (!config.countLogs.enabled) {
        return;
    }

    libs.bufferedLogSubject.subscribe((logs: types.Log[]) => {
        libs.sampleSubject.next({
            hostname: libs.hostname,
            values: {
                logCount: logs.length,
            },
        });
    });
}
