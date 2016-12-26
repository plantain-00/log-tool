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
    constructor(action: () => void) {
        this.eventTarget.addEventListener("reconnect", () => {
            action();
        });
        this.connect();
    }
    reconnect(timeout: number = 2000) {
        setTimeout(() => {
            this.connect();
        }, timeout);
    }
    private generateEvent(typeArg: string) {
        const event = document.createEvent("CustomEvent");
        event.initCustomEvent(typeArg, false, false, undefined);
        return event;
    }
    private connect() {
        this.eventTarget.dispatchEvent(this.generateEvent("reconnect"));
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
        console.log(ws);
        reconnector.reconnect();
    };
});
