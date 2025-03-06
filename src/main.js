import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import axios from 'axios';
import router from './router/index.js';
import { createPinia } from 'pinia';


//primevue theme
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';


import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Toolbar from 'primevue/toolbar';
import Sidebar from 'primevue/sidebar';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import paginator from 'primevue/paginator';

const app = createApp(App);


app.use(PrimeVue, { ripple: true });
app.use(createPinia());
app.use(axios);
app.use(router);


app.component('pv-column', Column);
app.component('pv-column-group', ColumnGroup);
app.component('pv-row', Row);
app.component('pv-button', Button);
app.component('pv-data-table', DataTable);
app.component('pv-toolbar', Toolbar);
app.component('pv-sidebar', Sidebar);
app.component('pv-float-label', FloatLabel);
app.component('pv-input-text', InputText);
app.component('pv-input-icon', InputIcon);
app.component('pv-input-group', InputGroup);
app.component('pv-input-group-addon', InputGroupAddon);
app.component('pv-dropdown', Dropdown);
app.component('pv-dialog', Dialog);
app.component('pv-card', Card);
app.component('calendar', Calendar);
app.component('pv-multi-select', MultiSelect);
app.component('pv-tag', Tag);
app.component('select', Select);
app.component('pv-checkbox', Checkbox);
app.component('paginator', paginator);

app.mount('#app');