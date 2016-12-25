exports.config = {
    inflow: {
        enabled: false,
        port: 8001,
        host: "localhost",
    },
    outflow: {
        enabled: false,
        url: "ws://localhost:8001",
    },
    watcher: {
        enabled: true,
        paths: [
            "./logs/",
        ],
        filePositionsDataPath: "./log-tool.watcher.data",
    },
    gui: {
        enabled: true,
        port: 8000,
        host: "localhost",
    },
};
