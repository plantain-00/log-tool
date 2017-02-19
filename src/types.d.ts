export type Protocol = {
    requestId?: number;
    error?: string;
} & (FlowsProtocol | SearchProtocol | SearchResultProtocol | HistorySamplesProtocol | ResaveFailedLogsProtocol | ResaveFailedLogsResultProtocol | SearchSamplesProtocol | SearchSampleResultProtocol);

export type FlowsProtocol = {
    kind: "flows",
    serverTime?: string;
    flows: Flow[],
};

export type SearchProtocol = {
    kind: "search",
    search: {
        q: string;
        from: number;
        size: number;
    };
};

export type SearchResultProtocol = {
    kind: "search result",
    searchResult?: SearchLogsResult;
};

export type HistorySamplesProtocol = {
    kind: "history samples",
    historySamples: SampleFrame[];
};

export type ResaveFailedLogsProtocol = {
    kind: "resave failed logs",
};

export type ResaveFailedLogsResultProtocol = {
    kind: "resave failed logs result",
    resaveFailedLogsResult?: {
        savedCount: number;
        totalCount: number;
    };
};

export type SearchSamplesProtocol = {
    kind: "search samples",
    searchSamples: {
        from: string;
        to: string;
    };
};

export type SearchSampleResultProtocol = {
    kind: "search samples result",
    searchSampleResult?: SampleFrame[];
};

export type Flow =
    {
        kind: "log";
        log: Log;
    }
    |
    {
        kind: "sample";
        sample: Sample;
    };

export type Log = {
    time: string;
    content: string;
    filepath: string;
    hostname: string;
};

export type SearchLogsResult = {
    total: number;
    logs: Log[];
};

export type Sample = {
    hostname: string;
    port?: number;
    values: { [name: string]: number };
};

export type SampleFrame = {
    time: string;
    samples: Sample[];
};

export type ChartConfig = {
    enabled: boolean;
    name: string;
    description: string;
    compute?: (sample: { [name: string]: number }) => number;
    unit?: string;
    unitScale?: number;
};
