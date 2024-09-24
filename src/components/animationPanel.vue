<script>
export default {
  name: "animationPanel",
  data() {
    return {
      silbAction: 'idle'
    };
  },
  methods: {
    setSilbAction(newAction) {
      let errorTimeout = 5000;
      this.silbAction = newAction;
      if (newAction === 'error') {
        setTimeout(() => {
          if (this.silbAction === 'error') {
            this.silbAction = 'idle';
          }
        }, errorTimeout);
      }
    }
  }
};
</script>

<template>
  <section class="animationContainer">
    <div class="robot-container">
      <div :class="['eye', 'left', silbAction]"></div>
      <div :class="['eye' ,'right', silbAction]"></div>
      <div :class="['mouth', silbAction]"></div>
    </div>
  </section>
</template>

<style scoped>
.animationContainer {
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  width: 100%;
}

.robot-container {
  position: relative;
  width: 400px;
  height: 100%;
  background-image: url('../assets/animations/silb_base.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.eye {
  position: absolute;
  width: 40px;
  height: 20px;
  background-color: #6ee2ff;
  border-radius: 50%;
  top: 37%;
  animation: blink 2s infinite;
}

.eye.error {
  background-color: red;
}

.eye.left {
  left: 37%;
}

.eye.right {
  right: 37%;
}

/* Randomized blinking animation */
@keyframes blink {
  0%, 80%, 100% {
    height: 20px;
    top: 37%;
  }
  85%, 95% {
    height: 2px;
    top: 39%;
  }
}

.mouth {
  position: absolute;
  width: 5%;
  height: 2px;
  background-color: #6ee2ff;
  border-radius: 50px / 20px;
  left: 47.5%;
  top: 41%;
  transition: all 0.5s ease;
}

/* Idle mouth animation */
.mouth.idle {
  animation: smileChange 40s infinite ease-in-out;
}

/* Idle mouth animation */
.mouth.idle {
  animation: smileChange 25s infinite ease-in-out;
}

/* Yawn, Smile, and Mouth Movement Sequence */
@keyframes smileChange {
  /* Base state */
  0%, 12.5%, 22.5%, 40%, 50%, 62.5%, 75%, 100% {
    height: 2px;
    width: 5%;
    left: 47.5%;
    top: 41%;
  }

  /* Smile (mouth grows bigger) */
  25%, 37% {
    height: 5px;
    width: 20%;
    left: 40%;
    top: 41%;
  }

  /* Mouth moving left to right */
  67.5% {
    height: 5px;
    width: 5%;
    left: 46%;
    top: 40.5%;
  }
  70% {
    height: 5px;
    width: 5%;
    left: 49%;
    top: 41%;
  }
  75% {
    height: 5px;
    width: 5%;
    left: 47%;
    top: 41%;
  }

  /* Yawn (mouth grows bigger) */
  82.5% {
    height: 20px;
    width: 20%;
    left: 40%;
    top: 41%;
  }
}


/* Talking mouth animation */
.mouth.talk {
  animation: talkAnimation 1s infinite;
}

@keyframes talkAnimation {
  0%, 80%, 100% {
    height: 2px;
    width: 5%;
    left: 47.5%;
  }
  20% {
    height: 10px;
    width: 10%;
    left: 45%;
  }
  30% {
    height: 2px;
    width: 5%;
    left: 47.5%;
  }
  50% {
    height: 15px;
    width: 12%;
    left: 44%;
  }
  60% {
    height: 10px;
    width: 7%;
    left: 46%;
  }
  90% {
    height: 5px;
    width: 8%;
    left: 46.5%;
  }
}

/* Error mouth animation */
.mouth.error {
  background-color: black;
  position: relative;
}

.mouth.error:after {
  content: "∼";
  font-size: 30px;
  color: red;
  display: block;
  animation: errorAnimation 1.67s infinite ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(0deg);
}

/* Error mouth animation with rotation */
@keyframes errorAnimation {
  0%, 100% {
    transform: translate(-50%, -50%);
    font-size: 10px;
  }
  25% {
    transform: translate(-50%, -50%) translateX(-5px);
    font-size: 30px;
  }
  50% {
    transform: translate(-50%, -50%) translateX(5px);
    font-size: 30px;
  }
  75% {
    transform: translate(-50%, -50%) translateX(-5px);
    font-size: 30px;
  }
}
</style>
