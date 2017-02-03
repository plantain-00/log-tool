import * as libs from "./libs";
import * as config from "./config";

export function start() {
    if (!config.countLogs.enabled) {
        return;
    }

    libs.bufferedLogSubject.subscribe(logs => {
        libs.sampleSubject.next({
            hostname: libs.hostname,
            values: {
                logCount: logs.length,
            },
        });
    });
}
