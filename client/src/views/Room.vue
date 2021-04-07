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
            :x="selectedTile.x * 75"
            :y="selectedTile.y * 75"
            width="75"
            height="75"
            ></rect>

            <template v-for="(tile,index) in board">
              <image
              v-if="tile !== null"
              :href="'svg_chess_pieces/' + tile.type + tile.color + '.svg'"
              :x="(index % 8) * 75"
              :y="Math.floor(index / 8) * 75"
              width="72"
              height="72"
              :key="index"
              />
            </template>
        </svg>
      </div>

      <div style="text-align:center">{{ gameStatus }}</div>
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
      selectedTile: null,
      userColor: 'w',
      isUsersTurn: true,
      gameStatus: 'White to move...',
    };
  },
  methods: {
    flipBoard() {
      console.log('flicka da wrist');
      const newBoard = [];
      for (let i = 0; i < 64; i += 1) newBoard.push(null);

      this.board.forEach((tile, index) => {
        let y = Math.floor(index / 8);
        let x = index % 8;

        // rotate board 180 degrees
        x = 7 - x;
        y = 7 - y;

        const newIndex = y * 8 + x;
        newBoard[newIndex] = tile;
      });

      this.board = newBoard;
    },
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
    boardClick(event) {
      if (!this.isUsersTurn) return;

      const xPos = Math.floor(event.offsetX / 75);
      const yPos = Math.floor(event.offsetY / 75);

      if (this.selectedTile && this.selectedTile.x === xPos && this.selectedTile.y === yPos) {
        this.selectedTile = null;
        return;
      }

      // console.log(this.board);
      // console.log(yPos);
      // console.log(xPos);
      const tile = this.board[yPos * 8 + xPos];
      if (tile && tile.color === this.userColor && this.isUsersTurn) {
        // console.log(`it is: ${this.board[yPos][xPos]}`);
        this.selectedTile = { x: xPos, y: yPos };
      } else if (this.selectedTile) {
        let fromX = this.selectedTile.x;
        let fromY = this.selectedTile.y;
        let toX = xPos;
        let toY = yPos;

        // Rotate board positions if black
        if (this.userColor === 'b') {
          fromX = 7 - fromX;
          fromY = 7 - fromY;
          toX = 7 - toX;
          toY = 7 - toY;
        }

        const fromColumnLetter = String.fromCharCode(fromX + 97);
        const toColumnLetter = String.fromCharCode(toX + 97);
        const fromPos = fromColumnLetter + (8 - fromY);
        const toPos = toColumnLetter + (8 - toY);


        fetch(`/room/${this.room}/movepiece`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromPos,
            to: toPos,
          }),
        })
          .then(resp => resp.json())
          .then((resp) => {
            if (!resp.board) return;
            this.isUsersTurn = false;
            this.board = resp.board.flat();
            if (this.userColor === 'b') this.flipBoard(this.board);
            if (resp.winner !== 'none') {
              this.$store.commit('setCurrentRoom', '');
            }
            this.gameStatus = resp.gameStatus;
          })
          .catch(console.error);

        this.selectedTile = null;
      }

      console.log(`selected tile: ${this.selectedTile}`);
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('gameData', (gameData) => {
      this.board = gameData.board.flat();
      if (this.userColor === 'b') this.flipBoard(this.board);
      this.isUsersTurn = true;
      if (gameData.winner !== 'none') {
        this.$store.commit('setCurrentRoom', '');
      }
      this.gameStatus = gameData.gameStatus;
    });

    fetch(`/room/${this.room}/join`)
      .then(resp => resp.json())
      .then((resp) => {
        console.log(resp);
        console.log(resp.board);
        this.board = resp.board.flat();

        if (resp.playerBlack === this.$store.state.username) {
          if (resp.turn !== 'b') this.isUsersTurn = false;

          console.log('Is black...');
          this.userColor = 'b';
          this.flipBoard(this.board);
        }
      })
      .catch(console.error);
  },
};
</script>
