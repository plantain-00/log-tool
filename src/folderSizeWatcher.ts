import * as libs from "./libs";
import * as config from "./config";

export function start() {
    if (!config.folderSizeWatcher.enabled) {
        return;
    }

    setInterval(async () => {
        const values: { [name: string]: number } = {};
        for (const name in config.folderSizeWatcher.folders) {
            const folder = config.folderSizeWatcher.folders[name];
            values[name] = Math.round(await getSize(folder) / 1024);
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
