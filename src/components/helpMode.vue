<script>
export default {
  name: "helpMode",
  data() {
    return {
      selectedSubsection: null,
      highlightCoords: null, // New property to store the current coordinates for the highlight
      books: {
        chat: {
          page: 1,
          content: [
            { text: "En este modo Silbio te guiará por el proceso de hacer una cita con la  administración pública.", image: "/src/assets/helpScreens/chat_help_1.png" },
            { text: "Silbio te hará preguntas y puedes utilizar el <span class='helpTextHighlights' data-coords='570, 0, 620, 540'>campo de entrada</span> para contestarle.", image: "/src/assets/helpScreens/chat_help_2.png" },
            { text: "Silbio también te proveerá con <span class='helpTextHighlights' data-coords='105, 10, 170, 510'> botones o menús </span> para seleccionar opciones.", image: "/src/assets/helpScreens/chat_help_3.png" },
            { text: "Si en cualquier momento tienes dudas escribe 'ayuda' o apreta el bóton (?) en la esquina superior derecha para llegar aquí.", image: "/src/assets/helpScreens/chat_help_4.png" },
            { text: "Escribe 'inicio' o presiona el botón de reinicio (↺) para volver a comenzar.", image: "/src/assets/helpScreens/chat_help_5.png" },
            { text: "Tus respuestas se irán guardando en el panel de estado, dónde también podrás ver el progreso de las citas que ya has pedido.", image: "/src/assets/helpScreens/chat_help_6.png" },
            { text: "Una vez Silbio ha reunido toda la información que necesita, se pondrá a la cola para sacarla. Pulsa el botón de 'otra cita' para volver a empezar.", image: "/src/assets/helpScreens/chat_help_7.png" }
          ]
        },
        expert: {
          page: 1,
          content: [
            { text: "Este modo es para quien usa los servicios de Silbio a diario y no tiene tiempo para charlar. En este modo, las citas se pueden programar desde un formulario dinámico donde puedes guardar los datos que más usas.", image: "/src/assets/helpScreens/expert_help_1.png" },
            { text: "Mode experto 2.", image: "/src/assets/expert_mode_screen.png" },
            { text: "Modo experto 3.", image: "" }
          ]
        }
      }
    };
  },
  methods: {
    toggleSubsection(index) {
      this.selectedSubsection = this.selectedSubsection === index ? null : index;
    },
    passPage(event, book, direction) {
      event.preventDefault();
      event.stopPropagation();
      const newPage = this.books[book].page + direction;
      if (newPage >= 1 && newPage <= this.books[book].content.length) {
        this.books[book].page = newPage;
      }
    },
    showHighlight(coords) {
      this.highlightCoords = coords;
    },
    hideHighlight() {
      this.highlightCoords = null;
    }
  }
};

</script>

<template>
  <main class="main">
    <section class="section header">
      <h1>Panel de Ayuda</h1>
      <i>El menú en la esquina superior derecha sirve para cambiar entre modo chat, modo experto o este modo de ayuda. Haz click abajo sobre el modo sobre el que necesitas más información.</i>
    </section>

    <section class="section modes">
      <!-- Modo Guiado Section -->
      <div class="subsection" :class="{ selected: selectedSubsection === 0 }" @click="toggleSubsection(0)">
        <h3>Modo Guiado</h3>
        <img src="../assets/icons/chat.png" height="100" width="100" />
        <div class="drawer" @click.stop v-if="selectedSubsection === 0">
          <div ref="chatCarrousel">
            <transition name="flip" mode="out-in">
              <div :key="books.chat.page">
                <div class="pages">
                  <!-- Updated to enable highlighting with hover effect -->
                  <p v-html="books.chat.content[books.chat.page - 1].text" @mouseover="showHighlight($event.target.dataset.coords)" @mouseleave="hideHighlight"></p>
                  <div class="image-wrapper">
                    <img :src="books.chat.content[books.chat.page - 1].image" class="illustration" />
                    <div
                        v-if="highlightCoords"
                        class="highlight-box"
                        :style="{
                        top: highlightCoords.split(',')[0] + 'px',
                        left: highlightCoords.split(',')[1] + 'px',
                        width: highlightCoords.split(',')[3] - highlightCoords.split(',')[1] + 'px',
                        height: highlightCoords.split(',')[2] - highlightCoords.split(',')[0] + 'px'
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </transition>
            <button @click="passPage($event, 'chat', -1)" v-if="books.chat.page > 1" class="passPage backPage">↩</button>
            <button @click="passPage($event, 'chat', 1)" v-if="books.chat.page < books.chat.content.length" class="passPage nextPage">↪</button>
          </div>
        </div>
      </div>

      <!-- Modo Experto Section -->
      <div class="subsection" :class="{ selected: selectedSubsection === 1 }" @click="toggleSubsection(1)">
        <h3>Modo Experto</h3>
        <img src="../assets/icons/expert.png" height="100" width="100" />
        <div class="drawer" @click.stop v-if="selectedSubsection === 1">
          <div ref="expertCarrousel">
            <transition name="flip" mode="out-in">
              <div :key="books.expert.page">
                <div class="pages">
                  <!-- Updated to enable highlighting with hover effect -->
                  <p v-html="books.expert.content[books.expert.page - 1].text" @mouseover="showHighlight($event.target.dataset.coords)" @mouseleave="hideHighlight"></p>
                  <div class="image-wrapper">
                    <img v-if="books.expert.content[books.expert.page - 1].image" :src="books.expert.content[books.expert.page - 1].image" class="illustration" />
                    <div
                        v-if="highlightCoords"
                        class="highlight-box"
                        :style="{
                        top: highlightCoords.split(',')[0] + 'px',
                        left: highlightCoords.split(',')[1] + 'px',
                        width: highlightCoords.split(',')[3] - highlightCoords.split(',')[1] + 'px',
                        height: highlightCoords.split(',')[2] - highlightCoords.split(',')[0] + 'px'
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </transition>
            <button @click="passPage($event, 'expert', -1)" v-if="books.expert.page > 1" class="passPage backPage">↩</button>
            <button @click="passPage($event, 'expert', 1)" v-if="books.expert.page < books.expert.content.length" class="passPage nextPage">↪</button>
          </div>
        </div>
      </div>

      <!-- Modo de Ayuda Section -->
      <div class="subsection" :class="{ selected: selectedSubsection === 2 }" @click="toggleSubsection(2)">
        <h3>Modo de Ayuda</h3>
        <img src="../assets/icons/helpMode.png" height="100" width="100" />
        <div class="drawer" v-if="selectedSubsection === 2" @click.stop>
          <p>Estás aquí. Si tienes cualquier pregunta información escríbenos a <a href="mailto:info@silb.io">info@silb.io</a> y con gusto te ayudamos.</p>
        </div>
      </div>
    </section>

    <section class="section footer" v-if="selectedSubsection === null">
      &copy; 2024 silb.io. Todos los derechos reservados. Para más información escríbenos a <a href="mailto:info@silb.io">info@silb.io</a>
      <a href="#">Información Legal</a>
    </section>
  </main>
</template>





<style scoped>

.highlight-box {
  position: absolute;
  background-color: rgba(255, 235, 59, 0.5); /* Translucent yellow */
  border: 2px solid rgba(255, 235, 59, 0.8); /* Slightly more solid border */
  pointer-events: none; /* Ensure it does not block interaction */
  z-index: 100; /* Ensure it's above other content */
}

.image-wrapper {
  position: relative;
}



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
  border: 2px solid var(--border-color);
}

.subsection.selected {
  border-color: var(--accent-color); /* Change border color when selected */
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
  background: var(--background-color-light);
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
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
 margin: auto;
  background-color: var(--button-bg-color);
  color: var(--text-color);
  border: 1px solid var(--button-bg-dark);
  border-radius: 5px;
  cursor: pointer;
  z-index: 10; /* Ensure it is above other content */

  font-size: 50px;

  padding: 0;
}

.passPage.backPage {
  left: 10px !important; /* Adjusted for better positioning */
}

.passPage.nextPage {
  right: 10px !important; /* Adjusted for better positioning */
}

.passPage:hover {
  background-color: var(--button-hover-bg-color);
  color: var(--text-color-light);
}

.illustration {
  flex: 3 3 auto;
  max-width: 100%;
  max-height: 100%;;
}

.pages {
  display: flex;
  margin: auto 10%;
  border: 1px solid var(--border-color);
}

.pages p{
  flex: 2 2 auto;
  padding: 10px;
  color: var(--text-color-light);
  font-size: large;
  display: flex;
  align-items: center;
}

.pages img{
  flex: 1 1 0;
}
</style>
