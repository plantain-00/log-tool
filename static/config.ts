import * as types from "../src/types";

declare function loadConfig(config: types.Config): void;

export const defaultConfig: types.Config = {
    chart: [
        {
            enabled: true,
            name: "logCount",
            description: "日志数",
        },
        {
            enabled: true,
            name: "cpu",
            description: "CPU",
            unit: "%",
        },
        {
            enabled: true,
            name: "memory",
            description: "内存",
            unit: "%",
        },
    ],
    protobuf: {
        enabled: true,
    },
};

if (loadConfig) {
    loadConfig(defaultConfig);
}

defaultConfig.chart = defaultConfig.chart.filter(config => config.enabled);

for (const config of defaultConfig.chart) {
    if (!("unit" in config)) {
        config.unit = undefined;
    }
    if (!("unitScale" in config)) {
        config.unitScale = undefined;
    }
    if (!("compute" in config)) {
        config.compute = undefined;
    }
}
