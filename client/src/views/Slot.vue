<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center; margin-bottom: 10px;">
        <h1>{{ slot }}</h1>
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
  name: 'Slot',
  components: {},
  data() {
    return {
      slot: this.$route.params.slotName,
      // entries: [],
      reserveID: 0,
      socket: null,
      input: '',
      timeout: null,
    };
  },
  methods: {
    send() {
      fetch(`/slot/${this.slot}/book`, {
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
    this.timeout = setTimeout(() => {
      this.$router.push('/lobby');
    }, 20000);
    /*
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      this.entries = [...this.entries, msg];
    });
    */

    fetch(`/slot/${this.slot}/join`)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Unexpected failure when joining slot: ${this.slot}`);
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

    fetch(`/slot/${this.slot}/cancelreservation`, {
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
