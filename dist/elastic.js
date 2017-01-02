"use strict";
const tslib_1 = require("tslib");
const libs = require("./libs");
const config = require("./config");
function start() {
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
exports.start = start;
function search(q, from, size) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const response = yield libs.fetch(`${config.elastic.url}/_search?q=${q}&from=${from}&size=${size}&sort=time:desc`);
        const json = yield response.json();
        return {
            total: json.hits.total,
            logs: json.hits.hits.map(s => s._source),
        };
    });
}
exports.search = search;
