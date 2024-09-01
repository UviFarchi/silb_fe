<template>
  <main ref="chatArea" class="chatArea" @keydown.enter="handleUserInput">
    <div ref="chatStream" class="chatStream">
      <div v-for="(message, idx) in messages" :key="message.text" class="message"
           :class="{ 'messageUser': message.author === 'user', 'messageSilb': message.author !== 'user' }"
           :style="{ float: message.author === 'user' ? 'right' : 'left' }">
        <p v-html="message.text "/>

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
    <button class="restartButton" @click="restartChat">↺</button>
    <div class="userFormWrapper">
      <form @submit.prevent="handleUserInput" id="userForm">

        <input ref="userInput" id="userInput" type="text" placeholder="Escriba aquí...">
        <button type="button" @click="handleUserInput">Enviar</button>
      </form>
    </div>
  </main>

</template>

<script>
import silbConvo from '../assets/conversation.js';


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
      isWriting: false,
      currentMessage: null
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
        console.log('No message sent');
        return;
      }

      if (author === 'user') {
        if (message.text === 'ayuda') {
          this.$eventBus.emit('newMode', 'help');
        } else if (message.text === 'experto') {
          this.$eventBus.emit('newMode', 'expert');
        }
        else if(message.text === 'inicio'){
       this.restartChat();
        }
        this.removeOptionButtons();
        this.$refs.userInput.value = '';
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
      this.$eventBus.emit('setSilbAnimation', 'talk');
      this.step++;
      this.messages.push({text: message.text.charAt(0), author: 'silb', optionSelected: false});
      this.$nextTick(() => {
        this.adjustSpacerHeight();
        this.scrollNewMessageIntoView();
      });

      let currentMessage = this.messages[this.messages.length - 1];
      this.isWriting = true;
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
                this.$eventBus.emit('setSilbAnimation', 'idle');
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
          currentMessage.options.content = message.options.content;
          this.isWriting = false;
          this.$eventBus.emit('setSilbAnimation', 'idle');
          this.$eventBus.emit('runCompleted', '');
          break;

        default:
          this.isWriting = false;
          break;
      }
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
      this.$refs.userInput.value = selectedValues.join(' | '); // Set the selected values to the input field
      //this.sendMessage('user', {text: selectedValues});
      message.optionSelected = true;
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
    this.$eventBus.emit('startNewRun', true);
  }
}
</script>

<style scoped>


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
      black,
      rgba(0, 0, 0, 0)
  ) 1 100%;
  max-height: 100%;
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


#spacer {
  flex-shrink: 0;
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

.restartButton {
  width: 50px;
  position: absolute;
  top: 0;
  right: 15px;
  border: 1px solid yellow;
  background: lightgray;
}
</style>
