import { readableStreamEnd } from "clean-scripts";
import * as fs from "fs";
import decompress from "decompress";
import fetch from "node-fetch";
import * as stream from "stream";

// tslint:disable:no-console

const elasticVersion = "5.5.2";

(async () => {
    const res = await fetch(`https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${elasticVersion}.zip`);
    const contentLength = +res.headers.get("content-length");
    let size = 0;
    res.body.on("data", d => {
        size += d.length;
        console.log((size * 100.0 / contentLength).toFixed(2) + " % " + size);
    });
    res.body.pipe(fs.createWriteStream(`vendors/elasticsearch-${elasticVersion}.zip`));
    await readableStreamEnd(res.body as stream.Readable);
    await decompress(`vendors/elasticsearch-${elasticVersion}.zip`, "vendors");
})();
