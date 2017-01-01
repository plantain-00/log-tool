var chartConfigs = [
    {
        /**
         * be unique
         */
        name: "httpAverageResponsesTime",
        /**
         * be short and readable
         */
        description: "HTTP响应平均耗时",
        unit: "ms",
        /**
         * if true, will sum the values up
         */
        willSum: false,
        /**
         * if set, the value is not from sample data, but is computed from sample data
         */
        compute: sample => sample["httpRequestCount"] === 0
            ? 0
            : Math.round(sample["httpResponseTime"] / sample["httpRequestCount"]),
    },
    {
        name: "httpRequestCount",
        description: "HTTP请求数",
        unit: undefined,
        willSum: true,
        compute: undefined,
    },
    {
        name: "httpResponseTime",
        description: "HTTP响应耗时",
        unit: "ms",
        willSum: true,
        compute: undefined,
    },
];
