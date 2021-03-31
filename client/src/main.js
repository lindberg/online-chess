import Vue from 'vue';
import io from 'socket.io-client';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

(async () => {
  // Find out if the user is already logged in
  await fetch('/api/isAuthenticated')
    .then(resp => resp.json())
    .then((resp) => {
      store.commit('setUsername', resp.username);
      store.commit('setIsAuthenticated', resp.isAuthenticated);
    })
    .catch(console.error);

  new Vue({
    router,
    store,
    render: h => h(App),
    data: {
      socket: io().connect(),
      currentRoom: null,
    },
  }).$mount('#app');
})();
