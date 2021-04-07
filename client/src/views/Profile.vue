
<template>
  <div v-if="loaded" class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center;">
      <h1>{{ username }}'s profile</h1>
      <div class="well">
        <p>Wins: {{ userWins }}</p>
        <p>Draws: {{ userDraws }}</p>
        <p>Losses: {{ userLosses }}</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  components: {},
  data: () => ({
    loaded: false,
    username: '',
    userWins: 0,
    userLosses: 0,
    userDraws: 0,
    rooms: [],
    error: '',
    newRoomName: '',
  }),
  created() {
    /*
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      // const msgJson = msg.json();
      // console.log(msg);
      // this.updateUserRooms(msg);
      // this.rooms = msg;
      // this.entries = [...this.entries, msg];
    });
    */

    fetch('/api/isAuthenticated')
      .then(res => res.json())
      .then((resp) => {
        console.log(`isAuthenticated: ${resp.isAuthenticated}`);
        console.log(`username: ${resp.username}`);
        console.log(resp);
        if (resp.isAuthenticated) {
          this.username = resp.username;
          this.userWins = resp.userWins;
          this.userLosses = resp.userLosses;
          this.userDraws = resp.userDraws;
          // this.updateUserRooms(resp.list);
          this.loaded = true;
        } else {
          this.$store.commit('setIsAuthenticated', false);

          this.$router.push({
            path: 'login',
          });

          // throw new Error('Something went wrong!');
        }
      })
      .catch((error) => {
        console.error('Authentication failed unexpectedly');
        throw error;
      });
  },
};
</script>
