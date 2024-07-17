<script>
import Chat from "./components/chatMode.vue";
import StatusPanel from "./components/statusPanel.vue";
import  EventBus  from './eventBus.js';

export default {
  components: { StatusPanel, Chat },
  data() {
    return {
      mode: 0
    }
  },
  mounted() {
    this.$eventBus.on('updateUserAnswers', this.updateUserAnswers);
    this.$eventBus.on('startNewRun', this.startNewRun);
    this.$eventBus.on('newNotification', this.sendNotificationInChat)
  },
  methods: {
    updateUserAnswers(newAnswer) {
      this.$refs.statusPanel.handleUserAnswer(newAnswer);
    },
    startNewRun(e) {
      this.$refs.statusPanel.startNewRun();
    },
    sendNotificationInChat(message){
      console.log('send notification event received.')
      this.$refs.chat.sendMessage('silb',  {
        "text": message,
        "options": {"type": "info"}
      })
    }
  }
}
</script>

<template>
  <div class="app_wrapper">
    <chat ref="chat"></chat>
    <status-panel ref="statusPanel"></status-panel>
  </div>
</template>

<style scoped>
.app_wrapper {
  display: flex;
  margin: 0 auto;
  padding: 5vh 5vw;
  position: absolute;
  top: 0;
  left: 0;
  width: 90vw;
  height: 90vh;
  overflow: hidden;
}
</style>
