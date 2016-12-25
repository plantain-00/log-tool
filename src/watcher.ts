import * as libs from "./libs";

let positions: { [filepath: string]: number } = {};

export async function start(paths: string[], filePositionsDataPath: string) {
    // restore positions from file
    const filePositionData = await libs.readFileAsync(filePositionsDataPath);
    if (filePositionData) {
        try {
            positions = JSON.parse(filePositionData);
        } catch (error) {
            libs.errorSubject.next(error);
        }
    }

    // watch all paths
    for (const pathname of paths) {
        // make it clear that it is directory or file
        const stats = await libs.statAsync(pathname);
        if (stats) {
            // for every file, if no position in positions, read all file
            if (stats.isDirectory) {
                const files = await libs.readDirAsync(pathname);
                if (files) {
                    for (const file of files) {
                        const filepath = libs.path.resolve(pathname, file);
                        const fileStats = await libs.statAsync(filepath);
                        if (fileStats) {
                            readNewlyAddedLogsThenPublish(filepath, fileStats.size);
                        }
                    }
                    watch(pathname, true);
                }
            } else {
                readNewlyAddedLogsThenPublish(pathname, stats.size);
                watch(pathname, false);
            }
        }
    }

    // save postions every 1 seconds
    setInterval(() => {
        libs.fs.writeFile(filePositionsDataPath, JSON.stringify(positions, null, "  "), writeFileError => {
            if (writeFileError) {
                libs.errorSubject.next(writeFileError);
            }
        });
    }, 1000);
}

function watch(pathname: string, isDirectory: boolean) {
    libs.fs.watch(pathname, (event, filename) => {
        const filepath = isDirectory ? libs.path.resolve(pathname, filename) : pathname;
        libs.fs.stat(filepath, (fileError, fileStats) => {
            if (fileError) {
                // the file is deleted
                libs.errorSubject.next(fileError);
                delete positions[filepath];
            } else {
                // the file is updated or a new file
                readNewlyAddedLogsThenPublish(filepath, fileStats.size);
            }
        });
    });
}

function readNewlyAddedLogsThenPublish(filepath: string, end: number) {
    const position = positions[filepath];
    const start = position === undefined ? 0 : position;
    if (end > start) {
        libs.fs.createReadStream(filepath, {
            start,
            end,
            encoding: "utf8",
        }).on("data", (content: string) => {
            const lines = content.match(/[^\r\n]+/g);
            if (lines) {
                for (const line of lines) {
                    libs.logSubject.next({
                        content: line,
                        filepath,
                        hostname: libs.hostname,
                    });
                }
            }
        });
    }
    positions[filepath] = end;
}
