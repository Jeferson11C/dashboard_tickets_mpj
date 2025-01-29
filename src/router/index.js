import { createRouter, createWebHistory } from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";
import panelComponent from "../panel/pages/reporte.component.vue";
import admiComponent from "../administrador/pages/admi.component.vue";
import LoginComponent from "../login/pages/login.component.vue";
import graficoComponent from "../panel/pages/grafico.component.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: LoginComponent, meta: { title: "Login" } },
        { path: "/home", name: "home", component: HomeComponent, meta: { title: "Home" } },
        { path: "/reporte", component: panelComponent, meta: { title: "Reporte" } },
        { path: "/administrador", component: admiComponent, meta: { title: "Administrador" } },
        { path: "/grafico", component: graficoComponent, meta: { title: "Grafico" } },


    ]
});

router.beforeEach((to, from, next) => {
    let baseTitle = 'MPJ';
    document.title = `${baseTitle} | ${to.meta["title"]}`;
    next();
});

export default router;