import * as libs from "./libs";
import * as config from "./config";

export function start() {
    if (!config.os.enabled) {
        return;
    }

    setInterval(() => {
        const cpus = libs.os.cpus();
        for (let i = 0; i < cpus.length; i++) {
            const cpu = cpus[i];
            const rate = Math.round(100 - cpu.times.idle / (cpu.times.idle + cpu.times.irq + cpu.times.nice + cpu.times.sys + cpu.times.user) * 100);
            libs.sampleSubject.next({
                hostname: libs.hostname,
                port: i,
                values: {
                    cpu: rate,
                },
            });
        }

        libs.si.mem().then((a: { available: number, total: number }) => {
            const memory = Math.round(100 - a.available / a.total * 100);
            console.log(memory);
            libs.sampleSubject.next({
                hostname: libs.hostname,
                values: {
                    memory,
                },
            });
        });
    }, 1000);
}
