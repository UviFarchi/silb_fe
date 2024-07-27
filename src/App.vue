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
      bricked: true
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

    let qs = window.location.search;
    if (qs) {
      //TODO => Do proper id check, then emit
      this.$eventBus.emit('brickApp', false);
    } else {
      this.$eventBus.emit('brickApp', true);
    }
  },
  methods: {
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
      console.log('send notification event received.');
      this.$refs.chatMode.sendMessage('silb', {
        text: message,
        options: {type: "info"}
      });
    },
    setMode(newMode) {
      console.log('mode changed to', newMode);
      this.mode = newMode;
      this.$refs.statusPanel.resetCurrentRun();
      const mainStage = this.$refs.mainStage;
      switch (newMode) {
        case 'chat':
          mainStage.style.flex = '4 1 0';
          break;
        case 'help':
          mainStage.style.flex = '5 1 0';
          break;
        case 'expert':
          mainStage.style.flex = '6 1 0';
          break;
      }
    },
    setSilbAction(newAction) {
      this.$refs.animationPanel.setSilbAction(newAction);
    },
    brickApp(brick) {
      this.bricked = brick
    }
  }
}
</script>

<template>
  <h1 v-if="bricked">Sólo personal autorizado</h1>
  <div class="app_wrapper" v-else>
    <div id="modeCtrl">
      <input type="radio" id="helpMode" class="modeControls hidden" name="mode" @change="setMode('help')"
             :checked="mode === 'help'">
      <label for="helpMode" class="modeControls" title="Modo Ayuda">?</label>
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
    </div>
    <div class="container">
      <animation-panel ref="animationPanel" id="animationPanel" class="panel"></animation-panel>
      <div ref="mainStage" class="mainStage">
        <chat-mode v-if="mode === 'chat'" ref="chatMode" id="chatMode" class="mainStage panel scrollable"></chat-mode>
        <expert-mode v-if="mode === 'expert'" ref="expertMode" id="expertMode" class="mainStage panel"></expert-mode>
        <help-mode v-if="mode === 'help'" ref="helpMode" id="helpMode" class="mainStage panel"></help-mode>
      </div>
      <status-panel ref="statusPanel" id="statusPanel" class="panel"></status-panel>
    </div>
  </div>

</template>

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

#animationPanel {
  flex: 1 1 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}


#statusPanel {
  flex: 2 1 0;
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
  border: 1px solid gold;
  height: 50px;
  width: 160px;
  position: absolute;
  left: 0;
  top: 0;
}


</style>

