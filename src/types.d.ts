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

export type Message =
    {
        kind: "push logs";
        logs: Log[];
    }
    |
    {
        kind: "push error";
        errors: ErrorWithTime[];
    }
    |
    {
        kind: "search logs";
        q: string;
        from: number;
        size: number;
    }
    |
    {
        kind: "search logs result";
        result: SearchLogsResult;
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

export type Inflow =
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

export type Sample = {
    hostname: string;
    port: number;
    values: { [name: string]: number };
};
