import { createRouter, createWebHistory } from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";
import panelComponent from "../panel/pages/reporte.component.vue";
import admiComponent from "../administrador/pages/admi.component.vue";
import LoginComponent from "../login/pages/login.component.vue";
import graficoComponent from "../panel/pages/grafico.component.vue";
import historialComponent from "../historial/pages/historial.component.vue";

const routes = [
    { path: "/", name: "login", component: LoginComponent, meta: { title: "Login" } },
    { path: "/home", name: "home", component: HomeComponent, meta: { title: "Home" } },
    { path: "/reporte", name: "reporte", component: panelComponent, meta: { title: "Reporte" } },
    { path: "/administrador", name: "administrador", component: admiComponent, meta: { title: "Administrador" } },
    { path: "/grafico", name: "grafico", component: graficoComponent, meta: { title: "Grafico" } },
    {path: "/historial", name: "historial", component: historialComponent, meta: { title: "Historial" }}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    console.clear();
    let baseTitle = 'MPJ';
    document.title = `${baseTitle} | ${to.meta["title"]}`;

    const userRole = localStorage.getItem('userRole');
    if (to.path === '/administrador' && userRole !== 'Administrador') {
        next('/'); // Redirect to home if not an admin
    } else {
        next();
    }
});

export default router;