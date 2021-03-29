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

      <div style="margin: auto; width: 600px;">
        <svg
        width="600px"
        height="600px"
        style="background:rgb(255, 246, 203); border: 1px solid rgb(172, 172, 172); cursor: pointer"
        v-on:click="boardClick"
        >
            <pattern
            id="pattern-chess"
            x="0"
            y="0"
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
            >
                <rect class="white-tile" x="0" width="75" height="75" y="0"></rect>
                <rect class="white-tile" x="75" width="75" height="75" y="75"></rect>
            </pattern>


            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-chess)"></rect>

            <rect
            v-if="selectedTile !== null"
            class="selected-tile"
            :x="(selectedTile % 8) * 75"
            :y="600-75 - Math.floor(selectedTile / 8) * 75"
            width="75"
            height="75"
            ></rect>

            <template v-for="(tile,index) in board">
              <image
              v-if="tile !== null"
              :href="'svg_chess_pieces/' + tile.type + tile.color + '.svg'"
              :x="(index % 8) * 75"
              :y="600-75 - Math.floor(index / 8) * 75"
              width="72"
              height="72"
              :key="index"
              />
            </template>
        </svg>
      </div>

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
      board: [],
      selectedTile: 8,
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
        }),
      }).catch(console.error);

      this.$router.push('/lobby');
    },
    cancel() {
      this.$router.push('/lobby');
    },
    boardClick: function (event) {
      
    }
  },
  created() {
    fetch(`/room/${this.room}/join`)
      .then(resp => resp.json())
      .then((resp) => {
        console.log(resp);
        console.log(resp.chess);
        this.board = resp.chess.flat();
      })
      .catch(console.error);
  },
};
</script>
