export type Protocol =
    {
        kind: "flows",
        serverTime?: string;
        flows: Flow[],
    }
    |
    {
        kind: "search",
        search: {
            q: string;
            from: number;
            size: number;
        };
    }
    |
    {
        kind: "search result",
        searchResult: SearchLogsResult;
    }
    |
    {
        kind: "history samples",
        historySamples: SampleFrame[];
    }
    |
    {
        kind: "resave failed logs",
    }
    |
    {
        kind: "search samples",
        searchSamples: {
            from: string;
            to: string;
        };
    }
    |
    {
        kind: "search samples result",
        searchSampleResult: SampleFrame[];
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
