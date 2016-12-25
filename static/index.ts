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
