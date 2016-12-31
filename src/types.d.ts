export type Log = {
    time: string;
    content: string;
    filepath: string;
    hostname: string;
};

type ErrorWithTime = {
    time: string;
    error: string;
};

export type SearchLogsResult = {
    took: number;
    timed_out: boolean;
    _shards: {
        total: number;
        successful: number;
        failed: number;
    };
    hits?: {
        total: number;
        max_score: number;
        hits: {
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: Log;
        }[];
    };
};

export type Flow =
    {
        kind: "log";
        log: Log;
    }
    |
    {
        kind: "error";
        error: ErrorWithTime;
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
