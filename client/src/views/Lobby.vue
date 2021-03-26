<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Play chess</h1>
      </div>

      <div class="row">
        <div
          v-for="slot in slots"
          class="well"
          :class="getStatusClass(slot.status)"
          @click="redirect(slot)"
          :key="slot.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span style="color: grey;">{{ slot.assistant_name }}s slot </span>
              <span>{{ slot.name }}</span>
              <span v-if="slot.booked_by !== ''"> (booked by {{ slot.booked_by }})</span>
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
    slots: [],
  }),
  methods: {
    redirect(slot) {
      if (slot.status === 'available') {
        this.$router.push(`/slot/${slot.name}`);
      }
    },
    getStatusClass(status) {
      if (status === 'available') return 'slot-available';
      if (status === 'reserved') return 'slot-reserved';
      return 'slot-booked';
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      // const msgJson = msg.json();
      // console.log(msg);
      this.slots = msg;
      // this.entries = [...this.entries, msg];
    });

    fetch('/slotList')
      .then(res => res.json())
      .then((data) => {
        this.slots = data.list;
        // console.log(data);
        console.log(data.list);
      })
      .catch(console.error);
  },
};
</script>
