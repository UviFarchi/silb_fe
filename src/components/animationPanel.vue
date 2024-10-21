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
      let errorTimeout = 1500;
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
    <div class="robotContainer">
      <div class="faceContainer">
        <div :class="['eye', 'left', silbAction]"></div>
        <div :class="['eye', 'right', silbAction]"></div>
        <div :class="['mouth', silbAction]"></div>
      </div>
    </div>
  </section>
</template>


<style scoped>
.animationContainer {
  width: 100%;
  height: 100%;
}

.robotContainer {
  position: relative;
  width: auto;
  height: auto;
  background-image: url('../assets/animations/silb_base.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  aspect-ratio: 1;
  margin: 50% 0;
}

.faceContainer {
  position: relative;
  width: 41%;
  height: 25%;
  top: 25%;
  border-radius: 35%;
  left: 49%;
  transform: translate(-50%, -50%);
}

.eye {
  position: absolute;
  width: 20%;
  height: 20%;
  background-color: #6ee2ff;
  border-radius: 50%;
  top: 30%;
  animation: blink 3s infinite;
}

.eye.error {
  background-color: red;
}

.eye.left {
  left: 20%;
}

.eye.right {
  right: 20%;
}



/*  blinking animation */
@keyframes blink {
  0%, 80%, 100% {
    height: 20%;
    top: 30%;
  }
  85%, 95% {
    height: 0.1%;
    top: 40%;
  }
}

.mouth {
  position: absolute;
  width: 1%;
  height: 5%;
  background-color: #6ee2ff;
  border-radius: 50px / 20px;
  left: 50%;
  top: 70%;
  transform: translateX(-50%);
  transition: all 0.5s ease;
}

/* Idle mouth animation */
.mouth.idle {
  animation: smileChange 25s infinite ease-in-out;
}

/* Yawn, Smile, and Mouth Movement Sequence */
@keyframes smileChange {
  /* Base state */
  0%, 12.5%, 22.5%, 37%, 50%, 75%, 100% {
    height: 5%; /*2px;*/
    width: 5%;
    left: 50%;
    top: 70%;
    rotate: 0deg;
  }

  /* Smile (mouth grows bigger) */
  25% {
    height: 7%;
    width: 20%;
    left: 45%;
    top: 72%;
    rotate: 10deg;
  }
  /* Smile (mouth grows bigger) */
   60% {
    height: 7%;
    width: 20%;
    left: 55%;
    top: 72%;
    rotate: -10deg;
  }

  /* Mouth moving left to right */
  67.5% {
    height: 12%;
    width: 5%;
    left: 48%;
    top: 68%;
  }
  70% {
    height: 12%;
    width: 5%;
    left: 52%;
    top: 72%;
  }
  75% {
    height: 12%;
    width: 5%;
    left: 50%;
    top: 70%;
  }

  /* Yawn (mouth grows bigger) */
  82.5% {
    height: 40%;
    width: 20%;
    left: 48%;
    top: 50%;
  }
}


/* Talking mouth animation */
.mouth.talk {
  animation: talkAnimation 3s infinite;
}

/* Talking mouth animation */
@keyframes talkAnimation {
  0%, 95%, 100% {
    height: 2%;
    width: 5%;
    left: 50%;
    top: 70%;
  }
  5% {
    height: 6%;
    width: 8%;
    left: 50%;
    top: 69.5%;
  }
  10% {
    height: 12%;
    width: 14%;
    left: 50%;
    top: 68.5%;
  }
  15% {
    height: 8%;
    width: 10%;
    left: 50%;
    top: 69%;
  }
  20% {
    height: 16%;
    width: 18%;
    left: 50%;
    top: 67.5%;
  }
  25% {
    height: 5%;
    width: 7%;
    left: 50%;
    top: 70%;
  }
  30% {
    height: 10%;
    width: 12%;
    left: 50%;
    top: 69%;
  }
  35% {
    height: 18%;
    width: 20%;
    left: 50%;
    top: 67%;
  }
  40% {
    height: 4%;
    width: 6%;
    left: 50%;
    top: 70%;
  }
  45% {
    height: 14%;
    width: 16%;
    left: 50%;
    top: 68%;
  }
  50% {
    height: 20%;
    width: 22%;
    left: 50%;
    top: 66.5%;
  }
  55% {
    height: 6%;
    width: 8%;
    left: 50%;
    top: 69.5%;
  }
  60% {
    height: 15%;
    width: 17%;
    left: 50%;
    top: 67.5%;
  }
  65% {
    height: 5%;
    width: 7%;
    left: 50%;
    top: 70%;
  }
  70% {
    height: 12%;
    width: 14%;
    left: 50%;
    top: 68.5%;
  }
  75% {
    height: 8%;
    width: 10%;
    left: 50%;
    top: 69%;
  }
  80% {
    height: 16%;
    width: 18%;
    left: 50%;
    top: 67.5%;
  }
  85% {
    height: 4%;
    width: 6%;
    left: 50%;
    top: 70%;
  }
  90% {
    height: 10%;
    width: 12%;
    left: 50%;
    top: 69%;
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
  animation: errorAnimation 1s infinite normal;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(0deg);
}

/* Error mouth animation with rotation */
@keyframes errorAnimation {
  0%, 100% {
    transform: translate(-50%, -50%);
  }
  25% {
    transform: translate(-50%, -50%) translateX(-2px);
  }
  50% {
    transform: translate(-50%, -50%) translateX(2px);
  }
  75% {
    transform: translate(-50%, -50%) translateX(-2px);
  }
}
</style>
