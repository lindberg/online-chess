<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Play chess</h1>
      </div>
      <div class="well">
        Create room:
        <form v-on:submit.prevent="addRoom()">
          <input class="form-control" type="text" v-model="newRoomName" required autofocus />
          <input class="btn btn-default" style="margin-top: 5px;" type="submit" value="Add" />
          <p v-if="error !== ''" class="error">{{ error }}</p>
        </form>
      </div>
      <div class="row">
        <div
          v-for="room in rooms"
          class="well room-available"
          @click="redirect(room.name)"
          :key="room.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span style="color: grey;">{{ room.playerWhite }}s room </span>
              <span>{{ room.name }}</span>
            </h4>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Lobby',
  components: {},
  data: () => ({
    rooms: [],
    newRoomName: '',
    error: '',
  }),
  methods: {
    redirect(roomName) {
      this.$store.commit('setCurrentRoom', roomName);
      this.$router.push(`/room/${roomName}`);
    },
    addRoom() {
      console.log(this.newRoomName);

      fetch('/api/user/addRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.newRoomName,
        }),
      })
        .then(res => res.json())
        .then((resp) => {
          if (resp.room) {
            this.redirect(this.newRoomName);
            // this.$router.push(`/room/${this.newRoomName}`);
            // this.newRoomName = '';
          } else {
            this.error = resp.error;
          }
        })
        .catch((error) => {
          console.error('Adding a room failed unexpecedly');
          throw error;
        });
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      // const msgJson = msg.json();
      // console.log(msg);
      this.rooms = msg;
      // this.entries = [...this.entries, msg];
    });

    fetch('/roomList')
      .then(res => res.json())
      .then((data) => {
        this.rooms = data.list;
        // console.log(data);
        console.log(data.list);
      })
      .catch(console.error);
  },
};
</script>
