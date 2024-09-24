<template>
  <main ref="chatArea" class="chatArea">
    <div ref="chatStream" class="chatStream">
      <div v-for="(message, idx) in messages" :key="message.text" class="message"
           :class="{ 'messageUser': message.author === 'user', 'messageSilb': message.author !== 'user' }"
           :style="{ float: message.author === 'user' ? 'right' : 'left' }">
        <p v-html="message.text "/>

        <es-map v-if="message.options?.type==='map' && idx === messages.length - 1"></es-map>

        <div class="optionButtonsContainer">
          <button v-if="message.options?.type==='buttons'"
                  v-for="(option, index) in message.options.content"
                  :key="index"
                  class="optionButtons"
                  :style="assignColor(index)"
                  @click="(e)=>{setInputValue(option)}">
            {{ option }}
          </button>
        </div>
        <div v-if="message.options?.type==='checkbox' && idx === messages.length - 1" class="checkboxContainer">
          <div id="checkboxCrtlContainer">
            <button @click="selectAll(message)" title="Seleccionar Todas">Seleccionar Todas</button>
            <button @click="deselectAll(message)" title="No Seleccionar Ninguna">No Seleccionar Ninguna</button>
            <button @click="submitSelection(message)" title="Confirmar Selección">OK</button>
          </div>
          <div v-for="(option, index) in message.options.content" :key="index" class="checkboxPair">
            <input type="checkbox" :id="option" :value="option" v-model="message.selectedCheckboxes">
            <label :for="option">{{ option }}</label>
          </div>

        </div>
        <div v-if="message.options?.type==='dropdown'" class="dropdownWrapper">
          <select v-model="message.selectedOption" @change="handleOptionSelection($event, message)" class="dropdown">
            <option disabled :value="message.title" >{{ message.title }}</option>
            <option v-for="option in message.options.content" :key="option.text" :value="option.text">{{
                option.text
              }}
            </option>
          </select>
          <select v-if="message.selectedOption" v-model="message.selectedSubOption"
                  @change="handleSubOptionSelection($event, message)" class="dropdown">
            <option disabled :value="message.subtitle" >{{ message.subtitle }}</option>
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
    <button class="restartButton" @click="restartChat">↺</button>
    <div class="userFormWrapper">
      <form @submit.prevent="handleUserInput" id="userForm">
        <input ref="userInput" id="userInput" type="text" placeholder="Escriba aquí...">
        <button class="sendButton">Enviar</button>
      </form>
    </div>
  </main>

</template>

<script>
import silbConvo from '../assets/conversations/demo.js';


import EsMap from "./specialMessages/esMap.vue";


export default {
  name: "chatMode",
  components: {EsMap},
  data() {
    return {
      steps: silbConvo.steps,
      step: 0,
      messages: [],
      spacerHeight: 1000,
      currentMessage: null,
      lastValue: '',
    }
  },
  computed: {
    filteredOptions() {
      //TODO => Add functionality so that as the user types, the options in the question are part-matched and offered, with tab to fill.
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

      if (!message.text || this.$parent.$data.mode !== 'chat') {
        this.$eventBus.emit('setSilbAction', 'error');
        return;
      }

      if (author === 'user') {
        if (message.text === 'ayuda') {
          this.$eventBus.emit('newMode', 'help');
        } else if (message.text === 'experto') {
          this.$eventBus.emit('newMode', 'expert');
        } else if (message.text === 'inicio') {
          this.restartChat();
        }
        this.removeOptionButtons();
        this.messages.push({text: message.text, author: author, optionSelected: false});
        this.$nextTick(() => {
          this.$eventBus.emit('updateUserAnswers', message);
          this.adjustSpacerHeight();
          this.scrollNewMessageIntoView();
        });
        window.setTimeout(() => {
          this.sendMessage('silb', this.steps[this.step]);
        }, 1000);
      } else if (author === 'silb') {
        this.handleSilbMessage(message);
      }
    },

    handleSilbMessage(message) {
      console.log('Silb message received:', message);
      this.$eventBus.emit('setSilbAction', 'talk');
      this.step++;
      let messageFirst = JSON.parse(JSON.stringify(message));
      messageFirst.text = message.text.charAt(0);
      this.messages.push({...messageFirst, author: 'silb', optionSelected: false});
      this.$nextTick(() => {
        this.adjustSpacerHeight();
        this.scrollNewMessageIntoView();
      });

      let currentMessage = this.messages[this.messages.length - 1];
      let scrollCalled = false;
      let millisPerLetter = 20;
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
        }, millisPerLetter * i);
      }
      this.$refs.userInput?.focus();
    },

    async processMessageOptions(message, currentMessage) {
      currentMessage.options = {type: message.options.type, content: []};

      const promises = [];

      switch (message.options.type) {
        case 'info':
          console.log('info message received');
          promises.push(Promise.resolve());
          setTimeout(() => {
            this.sendMessage('silb', this.steps[this.step]);
          }, 1);
          break;

        case 'buttons':
        case 'checkbox':
          let millisPerButton = 100;
          currentMessage.selectedCheckboxes = [];
          promises.push(new Promise((resolve) => {
            for (let j = 0; j < message.options?.content?.length; j++) {
              setTimeout(() => {
                if (!currentMessage.optionSelected) {
                  currentMessage.options.content.push(message.options.content[j]);
                }
                if (j === message.options.content.length - 1) {
                  resolve();
                }
              }, millisPerButton * j);
            }
          }));

          break;

        case 'dropdown':
          currentMessage.options.content = message.options.content;
          currentMessage.selectedOption = message.title;
          currentMessage.selectedSubOption = message.subtitle;
          promises.push(Promise.resolve());
          break;

        case 'text':
          promises.push(Promise.resolve());
          break;

        case 'reset':
          console.log('reset message received');
          currentMessage.options.content = message.options.content;
          promises.push(Promise.resolve());
          break;

        default:
          promises.push(Promise.resolve());
          break;
      }

      await Promise.all(promises);
      this.$eventBus.emit('setSilbAction', 'idle');
    },
    removeOptionButtons() {
      // Implementation to remove option buttons from the last silb message
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage.author !== 'user' && lastMessage.options.type !== 'reset') {
        lastMessage.options = null;
      }
    },
    clearAllMessages() {
      this.messages = [];
      this.spacerHeight = 1000;
    },
    assignColor(index) {
      //TODO => Add functionality to assign colors to buttons based on the popularity of the answer. This info will be in the step object.
      const shadesOfPrimary = [
        // "var(--primary-color-lightest)",
        "var(--primary-color-lighter)",
        // "var(--primary-color-light)",
        // "var(--primary-color)",
        // "var(--primary-color-dark)",
        // "var(--primary-color-darker)",
        // "var(--primary-color-darkest)"
      ];

      const shadesOfSecondary = [
        // "var(--secondary-color-lightest)",
        // "var(--secondary-color-lighter)",
        // "var(--secondary-color-light)",
        //"var(--secondary-color)",
        "var(--secondary-color-dark)",
        // "var(--secondary-color-darker)",
        // "var(--secondary-color-darkest)",
      ];

      return {
        backgroundColor: shadesOfPrimary[index % shadesOfPrimary.length],
        color: shadesOfSecondary[index % shadesOfSecondary.length]
      };
    },
    handleOptionSelection(event, message) {
      message.selectedOption = event.target.value;
      const selectedOption = message.options.content.find(option => option.text === message.selectedOption);
      message.selectedSubOption = message.subtitle;
      message.options.content = message.options.content.map(option => ({
        ...option,
        visible: option.text === message.selectedOption
      }));
    },
    handleSubOptionSelection(event, message) {
      message.selectedSubOption = event.target.value;
      this.$refs.userInput.value = event.target.value;
      this.$refs.userInput.focus();
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
      this.$refs.userInput.value = selectedValues.join(' | '); // Set the selected values to the input field
      //this.sendMessage('user', {text: selectedValues});
      message.optionSelected = true;
      this.$refs.userInput.focus();
    },
    restartChat() {
      this.$eventBus.emit('startNewRun', true);
      this.clearAllMessages();
      this.step = 0;
      this.sendMessage('silb', this.steps[this.step]);
      this.$refs.chatStream.scrollTo({top: 0})

    },
    handleUserInput() {

      const userMessage = this.$refs.userInput.value;
      this.$refs.userInput.value = '';
      if (this.messages.length) {

        const lastMessage = this.messages[this.messages.length - 1];
        this.currentMessage = lastMessage;
        if (lastMessage.options?.type === 'checkbox') {
          this.submitSelection(lastMessage);
        } else if (lastMessage.options?.type === 'dropdown') {
          // this.$refs.userInput.value = lastMessage.selectedSubOption || lastMessage.selectedOption;
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
    this.$eventBus.emit('startNewRun', true);
  }
}
</script>

<style scoped>

.checkboxContainer button {
  background: var(--secondary-color-light);
  border: 2px solid var(--secondary-color);
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
  width: auto;
  height: 50px;
  min-width: 100px;
  padding: 0;
  margin: 10px;
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
  background: var(--background-color-dark);
  color: var(--text-color);
  border: 2px solid var(--secondary-color);
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
  background: var(--button-bg-color);
  border: 1px solid var(--button-bg-dark);
  color: var(--text-color);
  margin: 0 10px;
  padding: 10px 0;
}

#userForm button:hover {
  background: var(--button-hover-bg-color);
  border: 1px solid var(--button-bg-dark);
}

#userInput {
  padding: .5em;
  display: flex;
  flex: 4;
  border: var(--border-color);
}

#spacer {
  flex-shrink: 0;
}

.checkboxPair {
  flex: 1 1 auto;
}

.resetButton {
  background-color: var(--button-bg-color);
  color: var(--text-color);
  border: 1px solid var(--button-bg-dark);
  margin: 10px;
  font-weight: bold;
}

.restartButton {
  width: 50px;
  height: 50px;
  position: absolute;
  top: 0;
  right: 15px;
  font-size: 2em;
  background: var(--button-bg-color);
  border: 1px solid var(--button-bg-dark);
  color: var(--text-color);
}

.chatArea {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-width: 2px;
  border-style: solid;
  border-image: linear-gradient(
      to bottom,
      var(--button-bg-dark),
      rgba(0, 0, 0, 0)
  ) 1 100%;
  max-height: 100%;
}

div.chatStream {
  overflow-y: scroll;
  padding-bottom: 20px;
}

div.userFormWrapper {
  width: 90%;
  display: flex;
  padding: 20px 5%;
  background-color: var(--background-color-dark);
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
  border: var(--secondary-color) 2px solid;
  background: var(--primary-color-lighter);
  color: var(--text-color);
  align-self: flex-end;
}

.messageSilb {
  background: var(--secondary-color-lightest);
  color: var(--text-color);
  border: 2px solid var(--primary-color-dark);
  align-self: flex-start;
}

.optionButtonsContainer {
  display: flex;
  flex-wrap: wrap;
}

.messageSilb .optionButtons {
  border: 1px solid var(--border-color);
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
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
  background: var(--background-color-light);
  color: var(--text-color);
  border: 2px solid var(--secondary-color);
  padding: 10px;
  margin: 0; /* Remove space between checkboxes */
  border-radius: 10px;
  cursor: pointer;
  width: 100%; /* Ensure label takes the full width of the column */
  box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
  text-align: center; /* Center text horizontally */
}

.checkboxContainer input[type="checkbox"]:checked + label {
  background: var(--secondary-color);
  color: var(--text-color);
}

.sendButton {
  min-width: 15%;
}
</style>