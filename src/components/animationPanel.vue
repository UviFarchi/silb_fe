<script>
import idleGif from '../assets/idle_rect.gif';
import actionGif from '../assets/talk_rect.gif';
import errorGif from '../assets/error_rect.gif';

export default {
  name: "animationPanel",
  data() {
    return {
      animations: {
        idle: idleGif,
        talk: actionGif,
        error:errorGif
      },
      silbAction: 'idle'
    }
  },
  methods: {
    setSilbAction(newAction) {
      this.silbAction = newAction;
    }
  }
}
</script>


<template>
  <section class="animationContainer"
           v-bind:style="{ 'background-image': 'url(' + animations[silbAction] + ')' }">
  </section>
</template>

<style scoped>
.animationContainer {
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  width: 100%;
}
</style>