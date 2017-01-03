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

export type Protocol = {
    kind: "flows" | "search" | "search result" | "history samples",
    serverTime?: string;
    flows?: Flow[],
    search?: {
        q: string;
        from: number;
        size: number;
    };
    searchResult?: SearchLogsResult;
    historySamples?: SampleFrame[];
};

export type Sample = {
    hostname: string;
    port: number;
    values: { [name: string]: number };
};

export type SampleFrame = {
    time: string;
    samples: Sample[];
};

export type ChartConfig = {
    name: string;
    description: string;
    willSum: boolean;
    compute?: (array: { [name: string]: number }) => number;
    unit?: string;
    sum?: number;
};
