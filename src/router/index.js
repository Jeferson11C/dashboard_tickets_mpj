import {createRouter, createWebHistory} from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/",            component: HomeComponent, meta: { title: "Home"}},

    ]
});

router.beforeEach((to, from, next) => {
    let baseTitle = 'MPJ';
    document.title = `${ baseTitle } | ${ to.meta["title"]}`;
    next();

    authenticationGuard(to, from, next);
});

export default router;
