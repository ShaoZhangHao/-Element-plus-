import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Icon } from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'

// import './style/test.scss'
const app = createApp(App)
app.component(Icon)
app.use(store).use(router).mount('#app')
