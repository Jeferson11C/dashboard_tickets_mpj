import { createRouter, createWebHistory } from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";
import panelComponent from "../panel/pages/panel.component.vue";
import admiComponent from "../administrador/pages/admi.component.vue";
import LoginComponent from "../login/pages/login.component.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: LoginComponent, meta: { title: "Login" } },
        { path: "/home", name: "home", component: HomeComponent, meta: { title: "Home" } },
        { path: "/panel", component: panelComponent, meta: { title: "Panel" } },
        { path: "/administrador", component: admiComponent, meta: { title: "Administrador" } },
    ]
});

router.beforeEach((to, from, next) => {
    let baseTitle = 'MPJ';
    document.title = `${baseTitle} | ${to.meta["title"]}`;
    next();
});

export default router;