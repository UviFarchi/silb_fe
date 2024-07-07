<script>
import Chat from "./components/chat.vue";
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
    EventBus.on('updateUserAnswers', this.updateUserAnswers);
    EventBus.on('startNewRun', this.startNewRun);
  },
  methods: {
    updateUserAnswers(newAnswer) {
      this.$refs.statusPanel.addUserAnswer(newAnswer);
    },
    startNewRun(e) {
      this.$refs.statusPanel.startNewRun();
    }
  }
}
</script>

<template>
  <div class="app_wrapper">
    <chat></chat>
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
