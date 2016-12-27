export type Log = {
    content: string;
    filepath: string;
    hostname: string;
};

export type Message = PushLogsMessage | PushErrorsMessage | SearchLogsMessage | SearchLogsResultMessage;

export type PushLogsMessage = {
    kind: "push logs";
    logs: Log[];
};

export type PushErrorsMessage = {
    kind: "push error";
    errors: string[];
};

export type SearchLogsMessage = {
    kind: "search logs";
    q: string;
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
