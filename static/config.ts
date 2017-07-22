export type ChartConfig = {
    enabled: boolean;
    name: string;
    description: string;
    compute?: (sample: { [name: string]: number }) => number;
    unit?: string;
    unitScale?: number; // eg: { unit: "KB", unitScale: 1024 }, 10240 B -> 10 KB
};

type Config = {
    chart: ChartConfig[];
    protobuf: {
        enabled: boolean;
    };
};

declare function loadConfig(config: Config): void;

export const defaultConfig: Config = {
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
