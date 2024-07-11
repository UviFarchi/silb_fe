<template>
  <main class="chatWrapper">
    <section ref="animationArea" class="animationArea"
             v-bind:style="{ 'background-image': 'url(' + silbAction + '_rect.gif)' }">

      <input type="checkbox" id="helpMode" class="modeControls hidden" v-model="helpMode" >
      <label for="helpMode" class="modeControls" title="Modo Ayuda">?</label>
      <input type="checkbox" id="expertMode" class="modeControls hidden" v-model="expertMode">
      <label for="expertMode" class="modeControls" title="Modo Experto"><img src="../assets/expert.png"/></label>
    </section>
    <section ref="chatArea" class="chatArea" @keydown.enter="handleUserInput">
      <div ref="chatStream" class="chatStream" v-if="!expertMode && !helpMode">
        <div v-for="(message, idx) in messages" :key="message.text" class="message"
             :class="{ 'messageUser': message.author === 'user', 'messageSilb': message.author !== 'user' }"
             :style="{ float: message.author === 'user' ? 'right' : 'left' }">
          {{ message.text }}

          <es-map v-if="message.options?.type==='map' && idx === messages.length - 1"></es-map>

          <div class="optionButtonsContainer">
            <button v-if="message.options?.type==='buttons'" v-for="(option, index) in message.options.content"
                    :key="index" class="optionButtons" :style="'background:'+ this.assignColor(index)"
                    @click="(e)=>{setInputValue(option)}">{{ option }}
            </button>
          </div>
          <div v-if="message.options?.type==='checkbox' && idx === messages.length - 1" class="checkboxContainer">
            <div id="checkboxCrtlContainer">
              <button @click="selectAll(message)" title="Seleccionar Todas"><img src="../assets/select_all.png"
                                                                                 alt="Seleccionar Todas"/></button>
              <button @click="deselectAll(message)" title="No Seleccionar Ninguna"><img src="../assets/select_none.png"
                                                                                        alt="No Seleccionar Ninguna"/>
              </button>
              <button @click="submitSelection(message)" title="Confirmar Selección">OK</button>
            </div>
            <div v-for="(option, index) in message.options.content" :key="index" class="checkboxPair">
              <input type="checkbox" :id="option" :value="option" v-model="message.selectedCheckboxes">
              <label :for="option">{{ option }}</label>
            </div>

          </div>
          <div v-if="message.options?.type==='dropdown'" class="dropdownWrapper">
            <select v-model="message.selectedOption" @change="handleOptionSelection($event, message)" class="dropdown">
              <option disabled value="">Select an option</option>
              <option v-for="option in message.options.content" :key="option.text" :value="option.text">{{
                  option.text
                }}
              </option>
            </select>
            <select v-if="message.selectedOption" v-model="message.selectedSubOption"
                    @change="handleSubOptionSelection($event, message)" class="dropdown">
              <option disabled value="">Select a sub-option</option>
              <option
                  v-for="subOption in message.options.content.find(opt => opt.text === message.selectedOption)?.options"
                  :key="subOption" :value="subOption">{{ subOption }}
              </option>
            </select>
          </div>
          <div v-if="message.options?.type==='text' && idx === messages.length - 1">

          </div>
          <button class='resetButton' v-if="message.options?.type==='reset' && idx === messages.length - 1"
                  @click="restartChat">
            {{ message.options.content }}
          </button>
        </div>
        <div id="spacer" :style="{ height: spacerHeight + 'px' }"></div>
      </div>
      <div class="userFormWrapper" v-if="!expertMode">
        <form @submit.prevent="handleUserInput" id="userForm">
          <input ref="userInput" id="userInput" type="text" placeholder="Escriba aquí...">
          <button type="button" @click="handleUserInput">Enviar</button>
        </form>
      </div>
      <expert-mode v-if="expertMode"/>
      <help-mode v-if="helpMode"/>
      <button v-if="helpMode" @click="helpMode=false; this.restartChat();">Entendido</button>
    </section>
  </main>
</template>

<script>
import silbConvo from '../assets/conversation.js';
import eventBus from '../eventBus.js';

import EsMap from "./esMap.vue";
import StatusPanel from "./statusPanel.vue";
import ExpertMode from "./expertMode.vue";
import HelpMode from "./helpMode.vue";

export default {
  name: "chat",
  components: {HelpMode, ExpertMode, EsMap, StatusPanel},
  data() {
    return {
      silbAction: 'idle',
      steps: silbConvo.steps,
      step: 0,
      messages: [],
      spacerHeight: 1000,
      isWriting: false,
      expertMode: false,
      helpMode: false,
      currentMessage: null
    }
  },
  watch: {
    helpMode(newVal) {
      if (newVal) {
        this.expertMode = false;
      }
    },
    expertMode(newVal) {
      if (newVal) {
        this.helpMode = false;
      }
    }
  },
  computed: {
    filteredOptions() {
      if (!this.currentMessage || this.currentMessage.options.type !== 'buttons') {
        return [];
      }
      const searchTerm = this.userInput.toLowerCase();
      return this.currentMessage.options.content.filter(option =>
          option.toLowerCase().includes(searchTerm)
      );
    }
  },
  methods: {
    sendMessage(author, message) {
      console.log('Message received:', message);

      if (!message.text || this.helpMode || this.expertMode) {
        console.log('No message sent');
        return;
      }

      if (author === 'user') {
        if (message.text === 'ayuda') {
          this.helpMode = true;
        }
        if (!this.helpMode && !this.expertMode) {
          this.removeOptionButtons();
          this.$refs.userInput.value = '';
          this.messages.push({text: message.text, author: author, optionSelected: false});
          this.$nextTick(() => {
            eventBus.emit('updateUserAnswers', message);
            this.adjustSpacerHeight();
            this.scrollNewMessageIntoView();
          });
          window.setTimeout(() => {
            this.sendMessage('silb', this.steps[this.step]);
          }, 1000);
        }
      } else if (author === 'silb') {
        this.handleSilbMessage(message);
      }
    },

    handleSilbMessage(message) {
      this.silbAction = 'talk';
      this.step++;
      this.messages.push({text: message.text.charAt(0), author: 'silb', optionSelected: false});
      this.$nextTick(() => {
        this.adjustSpacerHeight();
        this.scrollNewMessageIntoView();
      });

      let currentMessage = this.messages[this.messages.length - 1];
      this.isWriting = true;
      let scrollCalled = false;

      for (let i = 1; i < message.text.length; i++) {
        window.setTimeout(() => {
          currentMessage.text += message.text.charAt(i);
          if (!scrollCalled) {
            this.scrollNewMessageIntoView();
            scrollCalled = true;
          }
          if (i === message.text.length - 1) {
            this.processMessageOptions(message, currentMessage);
          }
        }, 30 * i);
      }
      this.$refs.userInput?.focus();
    },

    processMessageOptions(message, currentMessage) {
      currentMessage.options = {type: message.options.type, content: []};

      switch (message.options.type) {
        case 'info':
          console.log('info message received');
          this.sendMessage('silb', this.steps[this.step]);
          break;

        case 'buttons':
        case 'checkbox':
          currentMessage.selectedCheckboxes = []; // Initialize selectedCheckboxes
          for (let j = 0; j < message.options?.content?.length; j++) {
            window.setTimeout(() => {
              if (!currentMessage.optionSelected) {
                currentMessage.options.content.push(message.options.content[j]);
              }
              if (j === message.options.content.length - 1) {
                this.silbAction = 'idle';
                this.isWriting = false;
              }
            }, 10 * j);
          }
          break;

        case 'dropdown':
          currentMessage.options.content = message.options.content;
          currentMessage.selectedOption = message.options.content[0]?.text || ''; // Set the first option as selected
          const selectedOption = message.options.content[0];
          currentMessage.selectedSubOption = selectedOption?.options?.[0] || ''; // Set the first sub-option as selected
          this.$nextTick(() => {
            this.isWriting = false;
          });
          break;

        case 'text':
          this.isWriting = false;
          break;

        case 'reset':
          console.log('reset message received');
          eventBus.emit('startNewRun', true);
          currentMessage.options.content = message.options.content;
          this.isWriting = false;
          this.silbAction = 'idle';
          break;

        default:
          this.isWriting = false;
          break;
      }
    },
    removeOptionButtons() {
      // Implementation to remove option buttons from the last silb message
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage.author !== 'user') {
        lastMessage.options = null;
      }
    },
    clearAllMessages() {
      this.messages = [];
      this.spacerHeight = 1000;
    },
    assignColor(index) {
      return [
        "#FFFC88",
        "#FAF67A",
        "#F5F06B",
        "#EFEA5D",
        "#EAE44E",
        "#E5DD40",
        "#E0D731",
        "#DAD123",
        "#D5CB14",
        "#D0C506",
      ][parseInt(index.toString().slice(-1))];
    },
    handleOptionSelection(event, message) {
      message.selectedOption = event.target.value;
      const selectedOption = message.options.content.find(option => option.text === message.selectedOption);
      message.selectedSubOption = selectedOption?.options?.[0] || null; // Set the first sub-option as selected
      message.options.content = message.options.content.map(option => ({
        ...option,
        visible: option.text === message.selectedOption
      }));
    },
    handleSubOptionSelection(event, message) {
      message.selectedSubOption = event.target.value;
      this.$refs.userInput.value = event.target.value;
      //this.sendMessage('user', {text: event.target.value});
      //this.removeOptionButtons(event.target);
    },
    scrollNewMessageIntoView() {
      const messages = this.$refs.chatStream.querySelectorAll('.message');
      if (messages.length) {
        const lastMessage = messages[messages.length - 2];
        if (lastMessage) {
          lastMessage.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      }
    },
    adjustSpacerHeight() {
      const chatStream = this.$refs.chatStream;
      const currentHeight = chatStream.scrollHeight;
      this.spacerHeight = currentHeight + 1;
    },
    selectAll(message) {
      message.selectedCheckboxes = message.options.content.slice();
    },
    deselectAll(message) {
      message.selectedCheckboxes = [];
    },
    submitSelection(message) {
      const selectedValues = message.selectedCheckboxes;
      this.$refs.userInput.value = selectedValues.join(', '); // Set the selected values to the input field
      //this.sendMessage('user', {text: selectedValues});
      message.optionSelected = true;
    },
    restartChat() {
      this.clearAllMessages();
      this.step = 0;
      this.sendMessage('silb', this.steps[this.step]);
      this.$refs.chatStream.scrollTo({top: 0})

    },
    handleUserInput() {
      //TODO => Add functionality so that as the user types, the options in the question are part-matched and offered, with tab to fill.
      const userMessage = this.$refs.userInput.value;
      if (this.messages.length) {

        const lastMessage = this.messages[this.messages.length - 1];
        this.currentMessage = lastMessage;
        if (lastMessage.options?.type === 'checkbox') {
          this.submitSelection(lastMessage);
        } else if (lastMessage.options?.type === 'dropdown') {
          this.$refs.userInput.value = lastMessage.selectedSubOption || lastMessage.selectedOption;
        }
      }
      this.sendMessage('user', {text: userMessage});
    },
    setInputValue(option) {
      this.$refs.userInput.value = option;
      this.$refs.userInput.focus();
    },
  },
  mounted() {
    console.log('mounted');
    this.sendMessage('silb', this.steps[0]);
  }
}
</script>

<style scoped>
.chatWrapper {
  display: flex;
  flex: 4;
}

section.chatArea {
  flex-basis: 67%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-width: 2px;
  border-style: solid;
  border-image: linear-gradient(
      to bottom,
      black,
      rgba(0, 0, 0, 0)
  ) 1 100%;
}

div.chatStream {
  overflow-y: scroll;
  padding-bottom: 20px;
}

div.userFormWrapper {
  width: 100%;
  display: flex;
  margin-top: 3px;
  box-shadow: 0 0 40px 10px white;
}

section.animationArea {
  flex-basis: 33%;
  display: flex;
  justify-content: center;
  background: center no-repeat;
  background-size: contain;
  position: relative;
}

.message {
  width: 75%;
  border-radius: 10px;
  padding: .5em;
  margin: 5px;
  font-size: .8em;
  text-align: justify;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.messageUser {
  border: #407FFF 2px solid;
  background: #cbcbcb;
  color: black;
  align-self: flex-end;
}

.messageSilb {
  background: #cbcbcb;
  color: black;
  border: 2px solid yellow;
  align-self: flex-start;
}

.optionButtonsContainer {
  display: flex;
  flex-wrap: wrap;
}

.messageSilb .optionButtons {
  flex: 1 1 auto;
  border: 1px solid yellow;
  margin: 5px;
}

.checkboxContainer {
  display: flex;
  flex-wrap: wrap;
  margin: 5px 0;
  position: relative;
}

.checkboxPair {
  width: 50%; /* Two columns */
  display: flex;
  align-items: stretch; /* Align items to stretch to the same height */
}

.checkboxContainer input[type="checkbox"] {
  display: none;
}

.checkboxContainer label {
  display: block;
  background: #cbcbcb;
  color: black;
  border: 2px solid yellow;
  padding: 10px;
  margin: 0; /* Remove space between checkboxes */
  border-radius: 10px;
  cursor: pointer;
  width: 100%; /* Ensure label takes the full width of the column */
  box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
  text-align: center; /* Center text horizontally */
}

.checkboxContainer input[type="checkbox"]:checked + label {
  background: yellow;
  color: black;
}

.checkboxContainer button {
  background: gold;
  border: 2px solid yellow;
  padding: 10px;
  margin: 5px 0;
  border-radius: 10px;
  cursor: pointer;
  width: 100%; /* Ensure buttons take full width */
}

#checkboxCrtlContainer {
  position: absolute;
  width: 50px;
  right: -60px;
}

#checkboxCrtlContainer button {
  width: 50px;
  height: 50px;

  padding: 0;
  margin: 0;
}

#checkboxCrtlContainer button img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
}


.dropdownWrapper {
  display: flex;
  flex-direction: column;
  margin: 5px 0;
}

.dropdown {
  background: #cbcbcb;
  color: black;
  border: 2px solid yellow;
  padding: 5px;
  margin: 5px 0;
  border-radius: 10px;
  max-width: 100%;
}

#userForm {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex: 1;
}

#userForm button {
  display: flex;
  flex: 1;
  text-align: center;
  background: #cbcbcb;
  border: 1px solid gold;
  margin: 0 10px;
  padding: 10px 0;
  justify-content: center;
}
  #userForm button:hover {
    background: gold;
    border: 1px solid #cbcbcb;
  }
#userInput {
  padding: .5em;
  display: flex;
  flex: 4;
}


.hidden {
  display: none;
}

#spacer {
  flex-shrink: 0;
}

.modeControls + label {
  background-color: #ff4d00;
  color: black;
  border-radius: 100px;
  width: 20px;
  height: 20px;
  border: 2px solid yellow;
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;
  position: absolute;
  white-space: pre;
  font-weight: bold;
  font-size: 1.75em;
}

input.modeControls:checked + label {
  background-color: #84ff00;
  color: black;
  border-radius: 100px;
  width: 20px;
  height: 20px;

}

.modeControls img{
  height: 30px;
}
#expertMode + label {
  right: 0;
  top:50px;
}

#helpMode + label {
  right: 0;
  top:0;
}


.checkboxPair {
  flex: 1 1 auto;
}


.resetButton {
  background-color: yellow; /* Use background-color instead of background */
  color: black;
  border: 1px solid black;
  margin: 10px;
  font-weight: bold;
}
</style>
