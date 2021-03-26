
<template>
  <div v-if="loaded" class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center;">
      <h1>Profile for {{ username }}</h1>
      <div class="well">
        Add new slot:
        <form v-on:submit.prevent="addSlot()">
          <input class="form-control" type="text" v-model="newSlotName" required autofocus />
          <input class="btn btn-default" style="margin-top: 5px;" type="submit" value="Add" />
          <p v-if="error !== ''" class="error">{{ error }}</p>
        </form>
      </div>
      <div class="row">
        <div
          v-for="slot in slots"
          class="well"
          :class="getStatusClass(slot.status)"
          :key="slot.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>{{ slot.name }}</span>
              <span v-if="slot.booked_by !== ''">
                (booked by {{ slot.booked_by }})
              </span>
              <div><button v-on:click="removeSlot(slot.name)">Remove slot</button></div>
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
    slots: [],
    error: '',
    newSlotName: '',
  }),
  methods: {
    removeSlot(slotName) {
      fetch('/api/profile/removeSlot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: slotName,
        }),
      })
        .then((resp) => {
          if (resp.ok) {
            this.slots = Object.values(this.slots)
              .filter(slot => slot.name !== slotName)
              .reduce((res, slot) => ({ ...res, [slot.name]: slot }), {});
          }
        })
        .catch((error) => {
          console.error('Removing a slot failed unexpectedly');
          throw error;
        });
    },
    addSlot() {
      console.log(this.newSlotName);

      fetch('/api/profile/addSlot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.newSlotName,
        }),
      })
        .then(res => res.json())
        .then((resp) => {
          if (resp.slot) {
            this.newSlotName = '';
          } else {
            this.error = resp.error;
          }
        })
        .catch((error) => {
          console.error('Adding a slot failed unexpecedly');
          throw error;
        });
    },
    getStatusClass(status) {
      if (status === 'available') return 'slot-available';
      if (status === 'reserved') return 'slot-reserved';
      return 'slot-booked';
    },
    updateUserSlots(slots) {
      this.slots = [];
      slots.forEach((slot) => {
        if (slot.assistant_name === this.username) {
          // console.log(`${slot.assistant_name} == ${this.username}`);
          this.slots.push(slot);
        }
      });
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      // const msgJson = msg.json();
      // console.log(msg);
      this.updateUserSlots(msg);
      // this.slots = msg;
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
          this.updateUserSlots(resp.list);
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
