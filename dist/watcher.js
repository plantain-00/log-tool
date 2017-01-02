"use strict";
const tslib_1 = require("tslib");
const libs = require("./libs");
const config = require("./config");
let positions = {};
function start() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!config.watcher.enabled) {
            return;
        }
        // restore positions from file
        const filePositionData = yield libs.readFileAsync(config.watcher.filePositionsDataPath);
        if (filePositionData) {
            try {
                positions = JSON.parse(filePositionData);
            }
            catch (error) {
                libs.errorSubject.next(error);
            }
        }
        // watch all paths
        for (const pathname of config.watcher.paths) {
            // make it clear that it is directory or file
            const stats = yield libs.statAsync(pathname);
            if (stats) {
                // for every file, if no position in positions, read all file
                if (stats.isDirectory()) {
                    const files = yield libs.readDirAsync(pathname);
                    if (files) {
                        for (const file of files) {
                            const filepath = libs.path.resolve(pathname, file);
                            const fileStats = yield libs.statAsync(filepath);
                            if (fileStats) {
                                readNewlyAddedLogsThenPublish(filepath, fileStats.size);
                            }
                        }
                    }
                }
                else {
                    readNewlyAddedLogsThenPublish(pathname, stats.size);
                }
                watch(pathname, stats.isDirectory());
            }
        }
        // save postions every 1 seconds
        setInterval(() => {
            libs.fs.writeFile(config.watcher.filePositionsDataPath, JSON.stringify(positions, null, "  "), writeFileError => {
                if (writeFileError) {
                    libs.errorSubject.next(writeFileError);
                }
            });
        }, 1000);
    });
}
exports.start = start;
function watch(pathname, isDirectory) {
    libs.fs.watch(pathname, (event, filename) => {
        const filepath = isDirectory ? libs.path.resolve(pathname, filename) : pathname;
        libs.fs.stat(filepath, (fileError, fileStats) => {
            if (fileError) {
                // the file is deleted
                libs.errorSubject.next(fileError);
                delete positions[filepath];
            }
            else {
                // the file is updated or a new file
                readNewlyAddedLogsThenPublish(filepath, fileStats.size);
            }
        });
    });
}
function readNewlyAddedLogsThenPublish(filepath, end) {
    const position = positions[filepath];
    const start = position === undefined ? 0 : position;
    if (end > start) {
        libs.fs.createReadStream(filepath, {
            start,
            end,
            encoding: "utf8",
        }).on("data", (fileContentChanged) => {
            const lines = fileContentChanged.match(/[^\r\n]+/g);
            if (lines) {
                for (const line of lines) {
                    try {
                        const { skip, time, content } = config.watcher.parseLine(line, libs.moment, filepath);
                        if (!skip) {
                            libs.logSubject.next({
                                time,
                                content,
                                filepath,
                                hostname: libs.hostname,
                            });
                        }
                    }
                    catch (error) {
                        libs.errorSubject.next(error);
                        libs.logSubject.next({
                            time: libs.getNow(),
                            content: line,
                            filepath,
                            hostname: libs.hostname,
                        });
                    }
                }
            }
        });
    }
    positions[filepath] = end;
}
