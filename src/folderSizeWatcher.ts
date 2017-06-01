import * as libs from "./libs";
import * as config from "./config";

export function start() {
    if (!config.folderSizeWatcher.enabled) {
        return;
    }

    setInterval(async () => {
        const values: { [name: string]: number } = {};
        for (const name in config.folderSizeWatcher.folders) {
            if (config.folderSizeWatcher.folders.hasOwnProperty(name)) {
                const folder = config.folderSizeWatcher.folders[name];
                values[name] = await getSize(folder);
            }
        }
        libs.sampleSubject.next({
            hostname: libs.hostname,
            values,
        });
    }, 1000);
}

async function getSize(path: string) {
    const stats = await libs.statAsync(path);
    if (stats) {
        if (stats.isDirectory()) {
            let size = 0;
            const files = await libs.readDirAsync(path);
            if (files && files.length > 0) {
                for (const file of files) {
                    const filepath = libs.path.resolve(path, file);
                    size += await getSize(filepath);
                }
            }
            return size;
        } else if (stats.isFile()) {
            return stats.size;
        }
    }
    return 0;
}
