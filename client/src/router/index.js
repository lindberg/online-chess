import Vue from 'vue';
import VueRouter from 'vue-router';
import ListView from '../views/List.vue';
import SlotView from '../views/Slot.vue';
import LoginView from '../views/Login.vue';
import AdminView from '../views/Admin.vue';
// import store from '../store';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/list' },
  { path: '/list', component: ListView },
  { path: '/slot/:slotName', component: SlotView },
  { path: '/login', component: LoginView },
  { path: '/admin', component: AdminView },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

// Setup Authentication guard
/*
router.beforeEach((to, from, next) => {
  if (store.state.isAuthenticated || to.path === '/login') {
    next();
  } else {
    console.info('Unauthenticated user. Redirecting to login page.');
    next('/login');
  }
});
*/

export default router;
