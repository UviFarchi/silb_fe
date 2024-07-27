<script>


export default {
  name: "animationPanel",
  data() {
    return {
      silbAction: 'idle'
    }
  },
methods:{
  setSilbAction(newAction) {
    this.silbAction = newAction;
  }
}
}
</script>

<template>
  <section
           v-bind:style="{ 'background-image': 'url(' + silbAction + '_rect.gif)' }">
  </section>
</template>

<style scoped>

</style>