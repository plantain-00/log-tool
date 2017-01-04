[![Dependency Status](https://david-dm.org/plantain-00/log-tool.svg)](https://david-dm.org/plantain-00/log-tool)
[![devDependency Status](https://david-dm.org/plantain-00/log-tool/dev-status.svg)](https://david-dm.org/plantain-00/log-tool#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/log-tool.svg?branch=master)](https://travis-ci.org/plantain-00/log-tool)

# log-tool

#### features

+ watch log directories or files and read logs
+ transport logs to another log-tool server
+ save logs to elastic search server
+ push new logs to a web page, for monitor purpose
+ on the web page, search old logs
+ operate(filter, parse) logs as custom scripts

![](./architecture.png)

#### usage

```bash
node dist/index.js
```

or

```bash
node dist/index.js the-path-to-the-configuration-file
```

the default configuration file is `./log-tool.config.js`, it's in: [./log-tool.config.js](https://github.com/plantain-00/log-tool/blob/master/log-tool.config.js)

#### protocol

The message should be a string from `JSON.stringify(protocol)` or a protobuf encoded binary, the protocol's type is in: [./src/types.d.ts](https://github.com/plantain-00/log-tool/blob/master/src/types.d.ts) and its proto file is in: [./static/protocol.proto](https://github.com/plantain-00/log-tool/blob/master/static/protocol.proto)

#### create index for elastic

```bash
curl -XPUT http://localhost:9200/tool -d '
{
    "mappings" : {
        "logs" : {
            "properties" : {
                "time": {
                    "type": "date", 
                    "format": "yyyy-MM-dd HH:mm:ss"
                },
                "content": {
                    "type": "string"
                },
                "filepath": {
                    "type": "string"
                },
                "hostname": {
                    "type": "string"
                }
            }
        }
    }
}'
```
