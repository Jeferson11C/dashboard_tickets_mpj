import { createRouter, createWebHistory } from "vue-router";

const routes = [
    { path: "/", name: "login", component: () => import("../login/pages/login.component.vue"), meta: { title: "Login" } },
    { path: "/home", name: "home", component: () => import("../public/pages/home.component.vue"), meta: { title: "Home", requiresAuth: true } },
    { path: "/reporte", name: "reporte", component: () => import("../panel/pages/reporte.component.vue"), meta: { title: "Reporte", requiresAuth: true } },
    { path: "/administrador", name: "administrador", component: () => import("../administrador/pages/admi.component.vue"), meta: { title: "Administrador", requiresAuth: true } },
    { path: "/grafico", name: "grafico", component: () => import("../panel/pages/grafico.component.vue"), meta: { title: "Grafico", requiresAuth: true } },
    { path: "/historial", name: "historial", component: () => import("../historial/pages/historial.component.vue"), meta: { title: "Historial", requiresAuth: true } }
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

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        next({ name: 'login' });
    } else {
        next();
    }
});

export default router;