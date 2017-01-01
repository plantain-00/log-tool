var configs = [
    {
        name: "httpAverageResponsesTime", // the unique name
        description: "HTTP响应平均耗时",
        willSum: false, // if true, will sum the value up, or use `compute` to get the value displayed
        unit: "ms", // the unit of the sumed value or computed value
        compute: sample => sample["httpRequestCount"] === 0
            ? 0
            : Math.round(sample["httpResponseTime"] / sample["httpRequestCount"]),
    },
    {
        name: "httpRequestCount",
        description: "HTTP请求数",
        willSum: true,
    },
    {
        name: "httpResponseTime",
        description: "HTTP响应耗时",
        willSum: true,
        unit: "ms",
    },
];
