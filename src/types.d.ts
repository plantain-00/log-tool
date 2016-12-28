export type Log = {
    time: string;
    content: string;
    filepath: string;
    hostname: string;
};

export type Message = PushLogsMessage | PushErrorsMessage | SearchLogsMessage | SearchLogsResultMessage;

export type PushLogsMessage = {
    kind: "push logs";
    logs: Log[];
};

export type ErrorPush = {
    time: string;
    error: string;
};

export type PushErrorsMessage = {
    kind: "push error";
    errors: ErrorPush[];
};

export type SearchLogsMessage = {
    kind: "search logs";
    q: string;
    from: number;
    size: number;
};

export type SearchLogsResultMessage = {
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
    hits: {
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
