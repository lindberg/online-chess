
<template>
  <div v-if="loaded" class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center;">
      <h1>{{ username }}'s profile</h1>
      <div class="well">
        <p>Wins: {{ userWins }}</p>
        <p>Draws: {{ userDraws }}</p>
        <p>Losses: {{ userLosses }}</p>
      </div>
      <div class="well">
        Add new room:
        <form v-on:submit.prevent="addRoom()">
          <input class="form-control" type="text" v-model="newRoomName" required autofocus />
          <input class="btn btn-default" style="margin-top: 5px;" type="submit" value="Add" />
          <p v-if="error !== ''" class="error">{{ error }}</p>
        </form>
      </div>
      <div class="row">
        <div
          v-for="room in rooms"
          class="well"
          :class="getStatusClass(room.status)"
          :key="room.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>{{ room.name }}</span>
              <span v-if="room.booked_by !== ''">
                (booked by {{ room.booked_by }})
              </span>
              <div><button v-on:click="removeRoom(room.name)">Remove room</button></div>
            </h4>
          </div>
        </div>
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
  methods: {
    removeRoom(roomName) {
      fetch('/api/user/removeRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
        }),
      })
        .then((resp) => {
          if (resp.ok) {
            this.rooms = Object.values(this.rooms)
              .filter(room => room.name !== roomName)
              .reduce((res, room) => ({ ...res, [room.name]: room }), {});
          }
        })
        .catch((error) => {
          console.error('Removing a room failed unexpectedly');
          throw error;
        });
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
            this.newRoomName = '';
          } else {
            this.error = resp.error;
          }
        })
        .catch((error) => {
          console.error('Adding a room failed unexpecedly');
          throw error;
        });
    },
    getStatusClass(status) {
      if (status === 'available') return 'room-available';
      if (status === 'reserved') return 'room-reserved';
      return 'room-booked';
    },
    updateUserRooms(rooms) {
      this.rooms = [];
      rooms.forEach((room) => {
        if (room.assistant_name === this.username) {
          // console.log(`${room.assistant_name} == ${this.username}`);
          this.rooms.push(room);
        }
      });
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      // const msgJson = msg.json();
      // console.log(msg);
      this.updateUserRooms(msg);
      // this.rooms = msg;
      // this.entries = [...this.entries, msg];
    });

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
          this.updateUserRooms(resp.list);
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
