
<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Login</h1>
    <form v-on:submit.prevent="done()">
      <p class="error" v-if="error !== ''">{{error}}</p>
      Username
      <input class="form-control" type="text" v-model="name" required autofocus />
      Password
      <input class="form-control" type="password" v-model="password" required />
      <input class="btn btn-default" style="margin-top: 5px;" type="submit" value="Login" />
    </form>
    Don't have and account yet? <a href="#/register">Register now!</a>
  </div>
</template>

<script>
export default {
  name: 'Login',
  components: {},
  data: () => ({
    name: '',
    password: '',
    error: '',
  }),
  methods: {
    done() {
      fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.name,
          password: this.password,
        }),
      })
        .then((resp) => {
          if (resp.ok) return resp;
          this.$store.commit('setIsAuthenticated', false);
          this.error = 'Username or password incorrect!';
          this.password = '';

          throw new Error(resp.statusText);
          /*
          this.$router.push({
            path: 'login',
          });
          throw new Error(resp.text);
          */
        })
        .then(resp => resp.json())
        .then((resp) => {
          this.$store.commit('setCurrentRoom', resp.currentRoom);
          this.$store.commit('setUsername', resp.username);
          this.$store.commit('setIsAuthenticated', true);
          this.$router.push({
            path: 'lobby',
          });
        })
        .catch((error) => {
          console.error('Authentication failed unexpectedly');
          throw error;
        });
    },
  },
};
</script>
