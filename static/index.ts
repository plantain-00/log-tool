import * as Vue from "vue";
import Component from "vue-class-component";
import * as types from "../src/types";

@Component({
    template: require("raw!./app.html"),
})
class App extends Vue {
}

export const app = new App({
    el: "#body",
});

class Reconnector {
    private eventTarget = document.createElement("div");
    private timeout: number;
    constructor(action: () => void, private startTimeout: number = 3000, private increaseRate = 1.5, private endTimeout = 30000) {
        this.timeout = startTimeout;
        this.eventTarget.addEventListener("reconnect", () => {
            action();
        });
        action();
    }
    reconnect() {
        console.log(this.timeout);
        setTimeout(() => {
            if (this.timeout > this.endTimeout) {
                this.timeout = this.endTimeout;
            } else if (this.timeout < this.endTimeout) {
                this.timeout = Math.min(this.timeout * this.increaseRate, this.endTimeout);
            }
            this.eventTarget.dispatchEvent(this.generateEvent("reconnect"));
        }, this.timeout);
    }
    resetTimeout() {
        this.timeout = this.startTimeout;
    }
    private generateEvent(typeArg: string) {
        const event = document.createEvent("CustomEvent");
        event.initCustomEvent(typeArg, false, false, undefined);
        return event;
    }
}

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const reconnector = new Reconnector(() => {
    const ws = new WebSocket(`${wsProtocol}//${location.host}`);
    ws.onmessage = event => {
        const message: types.Message = JSON.parse(event.data);
        console.log(message);
    };
    ws.onclose = () => {
        reconnector.reconnect();
    };
    ws.onopen = () => {
        reconnector.resetTimeout();
    };
});
