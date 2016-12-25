exports.config = {
    inflow: {
        enabled: false,
        port: 8000,
        host: "localhost",
    },
    outflow: {
        enabled: false,
        url: "ws://localhost:8000",
    },
    watcher: {
        enabled: true,
        paths: [
            "./logs/",
        ],
        filePositionsDataPath: "./log-tool.watcher.data",
    },
};
