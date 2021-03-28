<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center; margin-bottom: 10px;">
        <h1>{{ room }}</h1>
      </div>
      <!--
      <div style="border: 2px solid black">
        <div v-for="(entry,index) in entries" :key="index">
          {{ entry }}
          <br />
        </div>
      </div>
      -->
      <form v-on:submit.prevent="send()">
        <input v-model="input" class="form-control" type="text" required autofocus />

        <div class="row" style="text-align: center; margin-top: 10px;">
          <input type="submit" value="Ok">
          <button type="button" v-on:click="cancel()">Cancel</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Room',
  components: {},
  data() {
    return {
      room: this.$route.params.roomName,
      // entries: [],
      reserveID: 0,
      socket: null,
      input: '',
      timeout: null,
    };
  },
  methods: {
    send() {
      fetch(`/room/${this.room}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.input,
          reservationID: this.reservationID,
        }),
      }).catch(console.error);

      this.$router.push('/lobby');
    },
    cancel() {
      this.$router.push('/lobby');
    },
  },
  created() {
    fetch(`/room/${this.room}/join`)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Unexpected failure when joining room: ${this.room}`);
        }
        return resp.json();
      })
      .catch(console.error)
      .then((data) => {
        // this.entries = data.list;
        this.reservationID = parseFloat(data.reservationID);
        console.log(`reservationID: ${this.reservationID}`);
      });
  },
  beforeDestroy() {
    clearTimeout(this.timeout);

    fetch(`/room/${this.room}/cancelreservation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reservationID: this.reservationID,
      }),
    }).catch(console.error);
  },
};
</script>
