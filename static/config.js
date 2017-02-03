var chartConfigs = [
    {
        name: "logCount",
        description: "日志数",
        unit: undefined,
        compute: undefined,
    },
    {
        name: "mysqlSize",
        description: "mysql数据",
        unit: "B",
        compute: undefined,
    },
    // {
    //     /**
    //      * be unique
    //      */
    //     name: "httpAverageResponsesTime",
    //     /**
    //      * be short and readable
    //      */
    //     description: "HTTP响应平均耗时",
    //     unit: "ms",
    //     /**
    //      * if set, the value is not from sample data, but is computed from sample data
    //      */
    //     compute: sample => sample["httpRequestCount"] === 0
    //         ? 0
    //         : Math.round(sample["httpResponseTime"] / sample["httpRequestCount"]),
    // },
    // {
    //     name: "httpRequestCount",
    //     description: "HTTP请求数",
    //     unit: undefined,
    //     compute: undefined,
    // },
    // {
    //     name: "httpResponseTime",
    //     description: "HTTP响应耗时",
    //     unit: "ms",
    //     compute: undefined,
    // },
];

var protobufConfig = {
    enabled: true,
};
