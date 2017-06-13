export type Protocol = {
    requestId?: number;
    error?: string;
} & (FlowsProtocol | SearchProtocol | SearchResultProtocol | HistorySamplesProtocol | ResaveFailedLogsProtocol | ResaveFailedLogsResultProtocol | SearchSamplesProtocol | SearchSampleResultProtocol);

export const enum ProtocolKind {
    flows = "flows",
    search = "search",
    searchResult = "search result",
    historySamples = "history samples",
    resaveFailedLogs = "resave failed logs",
    resaveFailedLogsResult = "resave failed logs result",
    searchSamples = "search samples",
    searchSamplesResult = "search samples result",
    log = "log",
    sample = "sample",
}

export type FlowsProtocol = {
    kind: ProtocolKind.flows,
    serverTime?: string;
    flows: Flow[],
};

export type SearchProtocol = {
    kind: ProtocolKind.search,
    search: {
        q: string;
        from: number;
        size: number;
    };
};

export type SearchResultProtocol = {
    kind: ProtocolKind.searchResult,
    searchResult?: SearchLogsResult;
};

export type HistorySamplesProtocol = {
    kind: ProtocolKind.historySamples,
    historySamples: SampleFrame[];
};

export type ResaveFailedLogsProtocol = {
    kind: ProtocolKind.resaveFailedLogs,
};

export type ResaveFailedLogsResultProtocol = {
    kind: ProtocolKind.resaveFailedLogsResult,
    resaveFailedLogsResult?: {
        savedCount: number;
        totalCount: number;
    };
};

export type SearchSamplesProtocol = {
    kind: ProtocolKind.searchSamples,
    searchSamples: {
        from: string;
        to: string;
    };
};

export type SearchSampleResultProtocol = {
    kind: ProtocolKind.searchSamplesResult,
    searchSampleResult?: SampleFrame[];
};

export type LogProtocol = {
    kind: ProtocolKind.log;
    log: Log;
};

export type SampleProtocol = {
    kind: ProtocolKind.sample;
    sample: Sample;
};

export type Flow = LogProtocol | SampleProtocol;

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
