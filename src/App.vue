<template>
  <h1 v-if="bricked">Sólo personal autorizado</h1>
  <div class="app_wrapper" v-else>
    <div id="modeCtrl">
      <input type="radio" id="helpMode" class="modeControls hidden" name="mode" @change="setMode('help')"
             :checked="mode === 'help'">
      <label for="helpMode" class="modeControls" title="Modo Ayuda">
        <img src="./assets/helpMode.png" alt="Modo Ayuda"/></label>
      <input type="radio" id="expertMode" class="modeControls hidden" name="mode" @change="setMode('expert')"
             :checked="mode === 'expert'">
      <label for="expertMode" class="modeControls" title="Modo Experto">
        <img src="./assets/expert.png" alt="Modo Experto"/>
      </label>
      <input type="radio" id="chatMode" class="modeControls hidden" name="mode" @change="setMode('chat')"
             :checked="mode === 'chat'">
      <label for="chatMode" class="modeControls" title="Modo Chat">
        <img src="./assets/chat.png" alt="Modo Chat"/>
      </label>
      <!--    TODO =>  Add an option for Public Computer, which will change the localStorage to sessionStorage to avoid data leaks.-->
    </div>
    <div class="container">
      <div ref="leftStage" class="leftStage">
        <animation-panel ref="animationPanel" id="animationPanel" class="panel"></animation-panel>
      </div>
      <div ref="mainStage" class="mainStage">
        <chat-mode v-if="mode === 'chat'" ref="chatMode" id="chatMode" class="panel scrollable"></chat-mode>
        <expert-mode v-if="mode === 'expert'" ref="expertMode" id="expertMode" class="panel"></expert-mode>
        <help-mode v-if="mode === 'help'" ref="helpMode" id="helpMode" class="panel"></help-mode>
      </div>
      <div ref="rightStage" class="rightStage">
        <status-panel ref="statusPanel" id="statusPanel" class="panel"></status-panel>
      </div>
    </div>
  </div>

</template>
<script>
import ChatMode from "./components/chatMode.vue";
import StatusPanel from "./components/statusPanel.vue";
import EventBus from './eventBus.js';
import HelpMode from "./components/helpMode.vue";
import ExpertMode from "./components/expertMode.vue";
import AnimationPanel from "./components/animationPanel.vue";

export default {
  components: {AnimationPanel, ExpertMode, HelpMode, StatusPanel, ChatMode},
  data() {
    return {
      mode: 'chat',
      bricked: true,
      scrollbarWidth: 0
    }
  },
  mounted() {
    this.$eventBus.on('updateUserAnswers', this.updateUserAnswers);
    this.$eventBus.on('startNewRun', this.startNewRun);
    this.$eventBus.on('newNotification', this.sendNotificationInChat);
    this.$eventBus.on('newMode', this.setMode);
    this.$eventBus.on('setSilbAnimation', this.setSilbAction);
    this.$eventBus.on('runCompleted', this.startJob);
    this.$eventBus.on('brickApp', this.brickApp);

    this.scrollbarWidth = this.getScrollbarWidth();

    if (this.checkToken()) {

      this.$eventBus.emit('brickApp', false);
    } else {
      this.$eventBus.emit('brickApp', true);
    }
  },
  methods: {
    getScrollbarWidth() {
      // Create a div for measuring scrollbar width
      let scrollDiv = document.createElement("div");
      // Apply styles to ensure scrollbar visibility
      scrollDiv.style.width = "100px";
      scrollDiv.style.height = "100px";
      scrollDiv.style.overflow = "scroll";
      scrollDiv.style.position = "absolute";
      scrollDiv.style.top = "-9999px";
      scrollDiv.style.visibility = "hidden"; // Hide from view
      // Append the div to the body
      document.body.appendChild(scrollDiv);
      // Calculate the scrollbar width
      let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      console.log('scrollbarWidth', this.scrollbarWidth);
      // Remove the div from the body
      document.body.removeChild(scrollDiv);

      return scrollbarWidth;
    },
    updateUserAnswers(newAnswer) {
      this.$refs.statusPanel.handleUserAnswer(newAnswer);
    },
    startNewRun(e) {
      this.$refs.statusPanel.startNewRun();
    },
    startJob() {
      this.$refs.statusPanel.startJob();
    },
    sendNotificationInChat(message) {
      if(this.mode === 'chat') {
        console.log('send notification event received.');
        this.$refs.chatMode.sendMessage('silb', {
          text: message,
          options: {type: "info"}
        });
      }
    },
    setMode(newMode) {
      console.log('mode changed to', newMode);
      this.mode = newMode;
      this.$refs.statusPanel.resetUserAnswers();
      const mainStage = this.$refs.mainStage;
      const leftStage = this.$refs.leftStage;
      const rightStage = this.$refs.rightStage;
      switch (newMode) {
        case 'chat':
          mainStage.style.flex = '4 1 0';
          leftStage.style.flex = '1 1 0';
          rightStage.style.flex = '2 1 0';
          break;
        case 'help':
          mainStage.style.flex = '4 1 0';
          leftStage.style.flex = '0 0 0';
          rightStage.style.flex = '0 0 0'
          break;
        case 'expert':
          mainStage.style.flex = '4 1 0';
          leftStage.style.flex = '0 0 0';
          rightStage.style.flex = '2 1 0';
          break;
      }
    },
    setSilbAction(newAction) {
      this.$refs.animationPanel.setSilbAction(newAction);
    },
    brickApp(brick) {
      this.bricked = brick
    },
    checkToken() {
      let token = new URL(location.href).searchParams.get('token');

      console.log(token)
      if (token) {
        //TODO => Do proper id check on server side, then emit
        let permittedTokens = [
          'eyJuYW1lIjoiSm9yZGkgQnJvdG9ucyIsIm9yZyI6IklDQUIifQ==', //Jordi
          'eyJuYW1lIjoiQWxtb2cgSGl6a3kiLCJvcmciOiJJbnZlc3RtZW50IGluIEJhcmNlbG9uYSJ9', //Almog
          'eyJuYW1lIjoiUmV1dmVuIEZhcmNoaSIsIm9yZyI6IlNJTEIifQ==' //Uvi
        ]
        return permittedTokens.includes(token);
      }
    }
  }
}
</script>
<style scoped>
.app_wrapper {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: lightgoldenrodyellow;
}

.modeControls + label {
  background: radial-gradient(gold, palegoldenrod);
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
  background: gold;
  color: black;
  border-radius: 100px;
  width: 20px;
  height: 20px;
}

.modeControls img {
  height: 30px;
}

#chatMode + label {
  left: 10px;
  top: 0;
}

#expertMode + label {
  left: 60px;
  top: 0;
}

#helpMode + label {
  left: 110px;
  top: 0;
}


.hidden {
  display: none;
}

.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.container > * {
  transition: all 0.5s ease;
}


.rightStage {
  flex: 2 1 0;
  display: flex;
  overflow: hidden;
}

.leftStage {
  flex: 1 1 0;
  display: flex;
}

.mainStage {
  flex: 4 1 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}


.scrollable {
  overflow-y: auto;
  flex: 1 1 0;
}

#modeCtrl {
  border: 1px inset white;
  height: 50px;
  width: 160px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 100;
}


</style>

