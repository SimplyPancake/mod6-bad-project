import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Camera from "simple-vue-camera";

const app = createApp(App);
app.component("camera", Camera);
app.use(ElementPlus);
app.mount("#app");
