<script>
import chatMode from "./chatMode.vue";

export default {
  name: "helpMode",
  data() {
    return {
      selectedSubsection: null,
      books: {chat: {page: 1, total: 7}, expert: {page: 1, total: 5}}
    };
  },
  methods: {
    toggleSubsection(index) {
      if (this.selectedSubsection === index) {
        this.selectedSubsection = null;
      } else {
        this.selectedSubsection = index;
      }
    },
    passPage(event, book, direction) {
      event.preventDefault();
      event.stopPropagation(); // Stop the event from propagating
      this.books[book].page += direction;
    }
  }
}
</script>

<template>
  <main class="main">
    <section class="section header">
      <h1>Panel de Ayuda</h1>
      <i>El menú en la esquina superior derecha sirve para cambiar entre modo chat, modo experto o este modo de
        ayuda. Haz click abajo sobre el modo sobre el que necesitas más información.</i>

    </section>
    <section class="section modes">
      <div
          class="subsection"
          :class="{ selected: selectedSubsection === 0 }"
          @click="toggleSubsection(0)"
      >
        <h3>Modo Guiado</h3>
        <img src="../assets/chat.png" height="100" width="100"/>
        <div class="drawer" @click.stop v-if="selectedSubsection === 0">
          <div ref="chatCarrousel">
            <transition name="flip" mode="out-in">
              <div :key="books.chat.page">
                <div v-if="books.chat.page===1">
                  <img src="../assets/chat_help_1.png" class="illustration"/>
                  En este modo Silbio te guiará por el proceso de hacer una cita con la administración pública.

                    Silbio te hará preguntas y puedes utilizar el campo de entrada para contestarle.

                </div>
                <div v-if="books.chat.page===2">

                    Si en cualquier momento tienes dudas escribe 'ayuda' para llegar aquí.

                </div>
                <div v-if="books.chat.page===3">
                  <p>
                    Escribe 'inicio' o presiona el botón de reinicio (↺) para volver a comenzar.
                  </p>
                </div>
              </div>
            </transition>
            <button @click="passPage($event, 'chat', -1)" v-if="books.chat.page>1">Previous</button>
            <button @click="passPage($event, 'chat',1)" v-if="books.chat.page<this.books.chat.total">Next</button>
          </div>
        </div  >
      </div>
      <div
          class="subsection"
          :class="{ selected: selectedSubsection === 1 }"
          @click="toggleSubsection(1)"
      >
        <h3>Modo Experto</h3>
        <img src="../assets/expert.png" height="100" width="100"/>
        <div class="drawer" v-if="selectedSubsection === 1" @click.stop>
          <div ref="expertCarrousel">
            <div v-if="books.expert.page===1">
              <img src="../assets/expert_mode_screen.png" class="illustration"/>
              <p>
                En este modo Silbio te guiará por el proceso de hacer una cita con la administración pública.
                Silbio te hará preguntas y puedes utilizar el campo de entrada para contestarle.
              </p>
            </div>
            <div v-if="books.expert.page===2">
              <p>
                Si en cualquier momento tienes dudas escribe 'ayuda' para llegar aquí.

              </p>
            </div>
            <div v-if="books.expert.page===3">
              <p>
                Escribe 'inicio' o presiona el botón de reinicio (↺) para volver a comenzar.
              </p>
            </div>
            <button @click="passPage($event,'expert', -1)" v-if="books.expert.page>1" class="passPage backPage">
              Previous
            </button>
            <button @click="passPage( $event,'expert',1)" v-if="books.expert.page<this.books.expert.total"
                    class="passPage nextPage">Next
            </button>
          </div>
        </div>
      </div>
      <div
          class="subsection"
          :class="{ selected: selectedSubsection === 2 }"
          @click="toggleSubsection(2)"
      >
        <h3>Modo de Ayuda</h3>
        <img src="../assets/helpMode.png" height="100" width="100"/>
        <div class="drawer" v-if="selectedSubsection === 2" @click.stop>
          <p>Estás aquí. Si tienes cualquier pregunta información escribenos a <a
              href="mailto:info@silb.io">info@silb.io</a> y con gusto te ayudamos.</p>
        </div>
      </div>
    </section>
    <section class="section footer" v-if="selectedSubsection===null">
     &copy; 2024 silb.io. Todos los derechos reservados. Para más información escribenos a <a
            href="mailto:info@silb.io">info@silb.io</a>
      <a href="#">Información Legal</a>
    </section>
  </main>

</template>


<style scoped>
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

.main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main > * {
  transition: all 0.5s ease;
}

.section {
  margin: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap; /* Prevent wrapping */
  flex: 1 1 100%;
  position: relative;
}
.section.header {
  flex: 1 1 0;
  line-height: 1.2;
  flex-wrap: wrap;
  width: 100%;
}
.section.modes {
   display: flex;
   flex-direction: row;
   flex: 8 8 0;
   overflow: hidden;
 }

.section.footer {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
}





section.header * {
  margin: 0;
  text-align: center;
  display: block;
  flex: 0 1 auto; /* Adjust to occupy only necessary space */
  width: 100%;
}

.section .subsection {
  display: flex;
  flex-direction: column;
  align-content: center;
  transition: flex 0.3s ease, max-height 0.3s ease;
  cursor: pointer;
  flex: 1 1 33%; /* Each subsection occupies one-third of the width */
  max-height: 200px; /* Initial max-height for unselected subsections */
  overflow: hidden; /* Prevent content from affecting the width */
  box-sizing: border-box; /* Include padding and border in the element's width and height */
  border: 2px solid white;
}

.subsection.selected {
  border-color: yellow; /* Change border color when selected */
  flex: 1 1 100%; /* Allow the selected subsection to occupy full width */
  max-height: none; /* Allow the selected subsection to grow vertically */
  height: auto; /* Allow height to adjust based on content */
  overflow-y: auto; /* Allow scrolling if content overflows */
}

.subsection:not(.selected) {
  flex: 1 1 10%; /* Ensure unselected subsections maintain one-third width */
  max-height: 200px; /* Retain max-height for unselected subsections */
}

.subsection img {
  margin: 0 auto;
}

.drawer {
  margin-top: 10px;
  display: none; /* Initially hide the content */
  background: white;
  position: relative;
}

.subsection.selected .drawer {
  display: block;
  position: relative;
}

/* Flip animation */
.flip-enter-active, .flip-leave-active {
  transition: transform 0.6s;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

.flip-enter, .flip-leave-to /* .flip-leave-active in <2.1.8 */
{
  transform: rotateY(180deg);
}

.flip-leave-active {
  transform: rotateY(-180deg);
}

.flip-enter-active {
  transform: rotateY(0);
}

.passPage {
  position: absolute !important;
  bottom: 10px !important; /* Adjusted for better visibility */
  padding: 5px 10px;
  color: white;
  border: 1px solid black;
  border-radius: 5px;
  cursor: pointer;
  z-index: 10; /* Ensure it is above other content */

}

.passPage.backPage {
  left: 10px !important; /* Adjusted for better positioning */
}

.passPage.nextPage {
  right: 10px !important; /* Adjusted for better positioning */
}

/* Adding hover effect */
.passPage:hover {
  background-color: black;
  color: white;
}

.illustration {
  height: 500px;
  float: right;
}
</style>
