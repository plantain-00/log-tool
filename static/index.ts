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

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${wsProtocol}//${location.host}`);
ws.onmessage = event => {
    const message: types.Message = JSON.parse(event.data);
    console.log(message);
};
