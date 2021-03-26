
<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Register</h1>
    <form v-on:submit.prevent="done()">
      <p class="error" v-if="error !== ''">{{error}}</p>
      Username
      <input class="form-control" type="text" v-model="name" required autofocus />
      Password
      <input class="form-control" type="password" v-model="password" required />
      Confirm password
      <input class="form-control" type="password" v-model="confirmPassword" required />
      <input class="btn btn-default" style="margin-top: 5px;" type="submit" value="Register" />
    </form>
  </div>
</template>

<script>
export default {
  name: 'Register',
  components: {},
  data: () => ({
    name: '',
    password: '',
    confirmPassword: '',
    error: '',
  }),
  methods: {
    done() {
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.name,
          password: this.password,
          confirmPassword: this.confirmPassword,
        }),
      })
        .then(resp => resp.json())
        .then((resp) => {
          if (resp.error.length === 0) return resp;
          this.error = resp.error;
          this.password = '';
          throw new Error(resp.text);
        })
        .then(() => {
          this.$store.commit('setIsAuthenticated', true);
          this.$router.push({
            path: 'login',
          });
        })
        .catch((error) => {
          console.error('Registration failed unexpectedly');
          throw error;
        });
    },
  },
};
</script>
