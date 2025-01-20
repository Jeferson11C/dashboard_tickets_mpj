import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import PrimeVue from 'primevue/config'

import axios from 'axios'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Toolbar from 'primevue/toolbar'
import Sidebar from 'primevue/sidebar'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Dropdown from 'primevue/dropdown'

import router from "./router/index.js";

const app = createApp(App)

app.use(PrimeVue, { ripple: true })
app.use(axios)
app.use(router)


app.component('pv-button', Button)
app.component('pv-data-table', DataTable)
app.component('pv-toolbar', Toolbar)
app.component('pv-sidebar', Sidebar)
app.component('pv-float-label', FloatLabel)
app.component('pv-input-text', InputText)
app.component('pv-input-icon', InputIcon)
app.component('pv-input-group', InputGroup)
app.component('pv-input-group-addon', InputGroupAddon)
app.component('pv-dropdown', Dropdown)

app.mount('#app')