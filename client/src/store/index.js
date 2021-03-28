import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// no-param-reassign prevents store.isAuthenticated = isAuthenticated
/* eslint-disable no-param-reassign */
export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    currentRoom: '',
    username: '',
  },
  mutations: {
    setIsAuthenticated(store, isAuthenticated) {
      store.isAuthenticated = isAuthenticated;
    },
    setCurrentRoom(store, roomName) {
      store.currentRoom = roomName;
    },
    setUsername(store, username) {
      store.username = username;
    },
  },
  actions: {
  },
  modules: {
  },
});
