import * as Vue from "vue";
import Component from "vue-class-component";

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
    console.log(event.data);
};
