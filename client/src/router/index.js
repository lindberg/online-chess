import Vue from 'vue';
import VueRouter from 'vue-router';
import ListView from '../views/List.vue';
import SlotView from '../views/Slot.vue';
import LoginView from '../views/Login.vue';
import ProfileView from '../views/Profile.vue';
import RegisterView from '../views/Register.vue';
// import store from '../store';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/list' },
  { path: '/list', component: ListView },
  { path: '/slot/:slotName', component: SlotView },
  { path: '/login', component: LoginView },
  { path: '/profile', component: ProfileView },
  { path: '/register', component: RegisterView },
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
