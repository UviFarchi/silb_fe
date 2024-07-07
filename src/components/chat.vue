<template>
  <main class="chatWrapper">
    <section ref="animationArea" class="animationArea" v-bind:style="{ 'background-image': 'url(' + silbAction + '_rect.gif)' }"></section>
    <section ref="chatArea" class="chatArea">
      <div ref="chatStream" class="chatStream">
        <div v-for="(message, idx) in messages" :key="message.text" class="message" :class="{ 'messageUser': message.author === 'user', 'messageSilb': message.author !== 'user' }" :style="{ float: message.author === 'user' ? 'right' : 'left' }">
          {{ message.text }}
          <es-map v-if="message.options?.type==='map' && idx === messages.length - 1"></es-map>
          <div class="optionButtonsContainer">
            <button v-if="message.options?.type==='buttons'" v-for="(option, index) in message.options.content" :key="index" class="optionButtons" :style="'background:'+ this.assignColor(index)" @click="(e)=>{sendMessage('user',{text:option}); removeOptionButtons(e.target);}">{{ option }}</button>
          </div>
          <div v-if="message.options?.type==='checkbox' && idx === messages.length - 1" class="checkboxContainer">
            <div v-for="(option, index) in message.options.content" :key="index">
              <input type="checkbox" :id="option" :value="option" v-model="message.selectedCheckboxes">
              <label :for="option">{{ option }}</label>
            </div>
            <button @click="selectAll(message)">Seleccionar Todas</button>
            <button @click="deselectAll(message)">No Seleccionar Ninguna</button>
            <button @click="submitSelection(message)">Confirmar Selección</button>
          </div>
          <div v-if="message.options?.type==='dropdown'" class="dropdownWrapper">
            <select v-model="message.selectedOption" @change="handleOptionSelection($event, message)" class="dropdown">
              <option disabled value="">Select an option</option>
              <option v-for="option in message.options.content" :key="option.text" :value="option.text">{{ option.text }}</option>
            </select>
            <select v-if="message.selectedOption" v-model="message.selectedSubOption" @change="handleSubOptionSelection($event, message)" class="dropdown">
              <option disabled value="">Select a sub-option</option>
              <option v-for="subOption in message.options.content.find(opt => opt.text === message.selectedOption)?.options" :key="subOption" :value="subOption">{{ subOption }}</option>
            </select>
          </div>
          <div v-if="message.options?.type==='text' && idx === messages.length - 1">

          </div>
          <button v-if="message.options?.type==='reset' && idx === messages.length - 1" @click="restartChat">{{ message.options.content }}</button>
        </div>
        <div id="spacer" :style="{ height: spacerHeight + 'px' }"></div>
      </div>
      <div class="userInput">
        <form @submit.prevent="sendMessage('user', {'text': $refs.userInput.value})" id="userForm">
          <input ref="userInput" id="userInput" type="text" placeholder="Escriba aquí...">
          <button type="submit">Enviar</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script>
import silbConvo from '../assets/conversation.js';
import { nextTick, ref } from "vue";
import esMap from "./esMap.vue";
import statusPanel from "./statusPanel.vue";
import EventBus from '../eventBus.js';

export default {
  name: "chat",
  components: { esMap, statusPanel },
  data() {
    return {
      silbAction: 'idle',
      steps: silbConvo.steps,
      step: 0,
      messages: [],
      spacerHeight: 1000,
      isWriting: false,
    }
  },
  methods: {
    sendMessage(author, message) {
      console.log('Message received:', message)
      if (!message.text) {
        return;
      } else if (author === 'user') {
        this.$refs.userInput.value = '';
        this.messages.push({ text: message.text, author: author, optionSelected: false });
        this.$nextTick(() => {
          EventBus.emit('updateUserAnswers', message);
          this.adjustSpacerHeight();
          this.scrollNewMessageIntoView();
        });
        window.setTimeout(() => {
          this.sendMessage('silb', this.steps[this.step])
        }, 1000);
      } else if (author === 'silb') {
        this.silbAction = 'talk';
        this.step++;
        this.messages.push({ text: message.text.charAt(0), author: author, optionSelected: false });
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
              currentMessage.options = { type: message.options.type, content: [] }
              if (['buttons', 'checkbox'].includes(message.options.type)) {
                currentMessage.selectedCheckboxes = [];  // Initialize selectedCheckboxes
                for (let j = 0; j < message.options?.content?.length; j++) {
                  window.setTimeout(() => {
                    if (!currentMessage.optionSelected) {
                      currentMessage.options.content.push(message.options.content[j]);
                    }
                    if (j === message.options.content.length - 1) {
                      this.silbAction = 'idle';
                      this.isWriting = false;
                    }
                  }, 10 * j)
                }
              } else if (message.options.type === 'dropdown') {
                currentMessage.options.content = message.options.content;
                this.$nextTick(() => {
                  this.isWriting = false;
                });
              } else if (message.options.type === 'text') {
                this.isWriting = false;
                this.$refs.userInput.focus();
              } else if (message.options.type === 'reset') {
                console.log('reset message received')
                EventBus.emit('startNewRun', true);

                currentMessage.options.content = message.options.content;
                this.isWriting = false;
                this.silbAction = 'idle'
              }
            }
          }, 30 * i);
        }
      }
    },
    removeOptionButtons(target) {
      const messageIndex = this.messages.findIndex(message => message.options?.content.includes(target.textContent));
      if (messageIndex !== -1) {
        const selectedOption = target.textContent;
        this.messages[messageIndex].optionSelected = true; // Set the flag for the specific message
        this.messages[messageIndex].options.content = [];
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
      message.selectedSubOption = null;
      message.options.content = message.options.content.map(option => ({
        ...option,
        visible: option.text === message.selectedOption
      }));
    },
    handleSubOptionSelection(event, message) {
      message.selectedSubOption = event.target.value;
      this.sendMessage('user', { text: event.target.value });
      this.removeOptionButtons(event.target);
    },
    scrollNewMessageIntoView() {
      const messages = this.$refs.chatStream.querySelectorAll('.message');
      if (messages.length) {
        const lastMessage = messages[messages.length - 2];
        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    adjustSpacerHeight() {
      const chatStream = this.$refs.chatStream;
      const currentHeight = chatStream.scrollHeight;
      this.spacerHeight = currentHeight + 1000;
    },
    selectAll(message) {
      message.selectedCheckboxes = message.options.content.slice();
    },
    deselectAll(message) {
      message.selectedCheckboxes = [];
    },
    submitSelection(message) {
      const selectedValues = message.selectedCheckboxes;
      this.sendMessage('user', { text: selectedValues });
      message.optionSelected = true;
    },
    restartChat() {
      this.clearAllMessages();
      this.step = 0;
      this.sendMessage('silb', this.steps[this.step]);
    }
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

div.userInput {
  width: 100%;
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
}

section.animationArea {
  flex-basis: 33%;
  display: flex;
  justify-content: center;
  background: center no-repeat;
  background-size: contain;
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
  flex-direction: column;
  margin: 5px 0;
}

.checkboxContainer input[type="checkbox"] {
  display: none;
}

.checkboxContainer label {
  display: inline-block;
  background: #cbcbcb;
  color: black;
  border: 2px solid yellow;
  padding: 10px;
  margin: 5px 0;
  border-radius: 10px;
  cursor: pointer;
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
  background: gold;
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

</style>
