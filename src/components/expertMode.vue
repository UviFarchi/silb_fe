<template>
  <div class="expertWrapper">
    <table class="expertTable">
      <thead>
      <tr>
        <th class="questionCell">Paso</th>
        <th class="answerCell">Datos</th>
        <th class="defaultCell">
          Predeterminada
          <button @click="clearDefaults" class="resetDefaults">
            Reestablecer
          </button>
        </th>
        <th class="okCell">
          Aceptar
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(step, index) in steps.filter(step => step.options.type !== 'info')"
          :key="index"
          class="messageRow"
          v-show="isVisible(index)"
          :class="step.options.type === 'reset' ? 'resetRow' : ''"
      >
        <td class="questionCell">{{ step.options.type !== 'reset' ? step.short || step.text : '' }}</td>
        <td class="answerCell">
          <div v-if="step.options.type === 'buttons'" class="btnGroup">
            <select @change="recordAnswer($event.target, $event.target.value, index)" v-model="selectedAnswers[index]">
              <option disabled value="">elija uno</option>
              <option
                  v-for="(option, idx) in step.options.content"
                  :key="idx"
                  class="btn"
                  :class="{ defaultAnswer: defaultAnswers[index] === option }"
              >{{ option }}
              </option>
            </select>
          </div>
          <div v-if="step.options.type === 'text'">
            <input
                type="text"
                class="textInput"
                placeholder="elija uno"
                v-model="selectedAnswers[index]"
                :class="{ defaultAnswer: defaultAnswers[index] === selectedAnswers[index] && defaultAnswers[index]}"
            />
          </div>
          <div v-if="step.options.type === 'checkbox'" class="checkboxesWrapper">
            <div
                v-for="(option, idx) in step.options.content"
                :key="idx"
                class="checkboxGroup"
            >
              <input
                  type="checkbox"
                  :id="'checkbox-' + index + '-' + idx"
                  class="checkbox"
                  :value="option"
                  @change="handleCheckboxChange(option, index, $event)"
                  :checked="selectedAnswers[index] && selectedAnswers[index].includes(option)"
                  :class="{ defaultAnswer: defaultAnswers[index] && selectedAnswers[index] && selectedAnswers[index].includes(option) }"
              />
              <label :for="'checkbox-' + index + '-' + idx" class="checkboxLabel">{{ option }}</label>
            </div>
          </div>
          <div v-if="step.options.type === 'dropdown' || (step.options.type === 'map' && step.options.expert)">
            <select class="dropdown" @change="recordAnswer($event.target, $event.target.value, index)"
                    v-model="selectedAnswers[index]">
              <option disabled value="">elija uno</option>
              <template
                  v-for="(category, idx) in (step.options.type === 'dropdown' ? step.options.content : step.options.expert)"
                  :key="idx"
              >
                <optgroup :label="category.text">
                  <option v-for="option in category.options" :key="option"
                          :class="{ defaultAnswer: defaultAnswers[index] === option }">{{ option }}
                  </option> <!-- Apply class here -->
                </optgroup>
              </template>
            </select>
          </div>
          <div v-if="step.options.type === 'map' && !step.options.expert">
            <div class="mapPlaceholder">No hay información</div>
          </div>
          <div v-if="step.options.type === 'reset'">
            <button class="resetBtn" @click="resetForm">{{ step.short }}</button>
          </div>
        </td>

        <td class="defaultCell">

          <input
              type="checkbox"
              @change="toggleDefault(index, $event)"
              :checked="defaultAnswers[index] !== undefined"
              v-if="step.options.type !== 'reset' && this.answers[index]"
          />
          {{ defaultAnswers[index] }}
          <i v-if="!valueEqualsDefault(defaultAnswers[index], answers[index])">La
            opción elegida no es la predeterminada. </i>
          <div v-if="step.options.type === 'checkbox'">
            <button @click="selectAll(step.options.content, index)" title="Seleccionar Todas">Seleccionar Todas
            </button>
            <button @click="deselectAll(index)">No Seleccionar Ninguna
            </button>
          </div>
        </td>
        <td class="okCell">
          <button v-if="defaultAnswers[index]!==undefined && step.options.type !== 'checkbox' && !answers[index]"
                  class="okBtn"
                  @click="recordAnswer($event.target, defaultAnswers[index], index)">OK
          </button>
          <button
              v-else-if="step.options.type==='text' && !answers[index]"
              class="okBtn"
              :disabled="!selectedAnswers[index]"
              @click="recordAnswer($event.target, selectedAnswers[index], index)">OK
          </button>
          <button
              v-if="step.options.type === 'checkbox' && !answers[index]"
              class="okBtn"
              @click="recordAnswer($event.target, selectedAnswers[index], index)">
            OK
          </button>

        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import conversation from '../assets/conversations/demo.js';


export default {
  data() {
    return {
      steps: conversation.steps,
      selectedAnswers: {},
      answers: {},
      defaultAnswers: {},
      visibleIndexes: []
    };
  },
  mounted() {

    this.loadDefaultAnswers();
    this.$eventBus.emit('startNewRun', false);
    // Add a global keydown listener for the Enter key
    window.addEventListener('keydown', this.handleEnterKey);
  },
  beforeDestroy() {
    // Remove the global keydown listener
    window.removeEventListener('keydown', this.handleEnterKey);
  },
  methods: {

    valueEqualsDefault(defaultAnswer, answer) {
      if (defaultAnswer === undefined || answer === undefined) {
        // If either is undefined, return true
        return true;
      }

      if (Array.isArray(defaultAnswer) && Array.isArray(answer)) {
        // Compare arrays for length and element equality
        return defaultAnswer.length === answer.length &&
            answer.every((value, i) => value === defaultAnswer[i]);
      }

      // Compare other types (strings, numbers, etc.)
      return defaultAnswer === answer;
    }
    ,
    handleEnterKey(event) {
      if (event.key === 'Enter') {
        // Find the first visible OK button and trigger its click event
        const visibleOkButton = document.querySelector('.okBtn:not([disabled]):not([hidden])');
        if (visibleOkButton) {
          visibleOkButton.click();
        }
      }
    },
    recordAnswer(target, answer, index) {
      target.closest('tr')?.classList.add('answered');

      const newAnswers = {...this.answers};
      const newSelectedOptions = {...this.selectedAnswers};

      Object.keys(this.answers).forEach((key) => {
        if (parseInt(key) > index) {
          delete newAnswers[key];
          delete newSelectedOptions[key];
        }
      });

      // Update answers and selections
      this.answers = {...newAnswers, [index]: answer};
      this.selectedAnswers = newSelectedOptions;

      // Emit answer only when OK is clicked
      this.emitAnswer(index);

      // Save answer as default if the checkbox is checked
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    }
    ,
    resetForm() {
      this.selectedAnswers = {};
      this.answers = {};
      this.defaultAnswers = {};
      this.visibleIndexes = [];
      this.$eventBus.emit('runCompleted', '');
      this.$eventBus.emit('startNewRun', false);
      this.loadDefaultAnswers();
    }
    ,
    selectAll(options, index) {
      this.selectedAnswers = {...this.selectedAnswers, [index]: [...options]};
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    },
    deselectAll(index) {
      this.selectedAnswers = {...this.selectedAnswers, [index]: []};
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    },
    isVisible(index) {
      const isVisible = index === 0 || this.answers.hasOwnProperty(index - 1);
      if (isVisible && !this.visibleIndexes.includes(index)) {
        this.visibleIndexes.push(index);
        this.preselectAndEmit(index);
      }
      return isVisible;
    },
    preselectAndEmit(index) {
      const answer = this.answers[index];
      if (answer !== undefined) {
        this.emitAnswer(index);
      }
    },
    handleCheckboxChange(option, index, event) {
      if (!this.selectedAnswers[index]) {
        this.selectedAnswers = {...this.selectedAnswers, [index]: []};
      }

      const selected = this.selectedAnswers[index];
      if (event.target.checked) {
        selected.push(option);
      } else {
        const optionIndex = selected.indexOf(option);
        if (optionIndex > -1) {
          selected.splice(optionIndex, 1);
        }
      }

      // Just update the internal state, no emission here
      this.selectedAnswers = {...this.selectedAnswers, [index]: selected};

      // Save the answer as a default, but do not emit yet
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    }

    ,
    toggleDefault(index, event) {
      if (event.target.checked) {
        if (Array.isArray(this.selectedAnswers[index])) {
          this.defaultAnswers = {...this.defaultAnswers, [index]: [...this.selectedAnswers[index]]};
        } else {
          this.defaultAnswers = {...this.defaultAnswers, [index]: this.answers[index]};
        }
      } else {
        const newDefaultAnswers = {...this.defaultAnswers};
        delete newDefaultAnswers[index];
        this.defaultAnswers = newDefaultAnswers;
      }
      this.saveDefaultAnswers();
    }
    ,
    saveDefaultAnswers() {
      localStorage.setItem('defaultAnswers', JSON.stringify(this.defaultAnswers));
    },
    loadDefaultAnswers() {
      const savedDefaults = localStorage.getItem('defaultAnswers');
      if (savedDefaults) {
        this.defaultAnswers = JSON.parse(savedDefaults);

        // Ensure selectedAnswers is updated correctly for checkbox-type inputs
        for (const [index, answer] of Object.entries(this.defaultAnswers)) {
          if (Array.isArray(answer)) {
            this.selectedAnswers = {...this.selectedAnswers, [index]: [...answer]};
          } else {
            this.selectedAnswers = {...this.selectedAnswers, [index]: answer};
          }
        }
      }
    }
    ,
    emitAnswer(index) {
      const answer = this.answers[index];

      this.$eventBus.emit('updateUserAnswers', {text: answer, index});

    },
    clearDefaults() {
      const confirmed = window.confirm("¿Estás seguro de que deseas restablecer todas las respuestas predeterminadas?");
      if (confirmed) {
        this.defaultAnswers = {};
        this.saveDefaultAnswers();
      }
    }
  },
};
</script>
<style scoped>
* {
  box-sizing: border-box;
  color: var(--text-color);
  font-family: Arial, sans-serif;
  font-size: 14px;
  text-align: left;
}

.expertWrapper {
  height: 100%; /* Adjust this height as needed */
  overflow-y: scroll;
}

table {
  width: 100%;
}

thead {
  position: sticky;
  top: 0;
  background: var(--background-color-light);
  color: var(--primary-color-dark);
}

th, td {
  border: 1px dotted var(--border-color);
  border-collapse: collapse;
  margin: 0;
}

option, optgroup {
  border-radius: 3px;
  color: var(--text-color);
  font-family: Arial, sans-serif;
  font-size: 14px;
  text-align: left;
}

select {
  border-radius: 3px;
  color: var(--text-color);
  font-family: Arial, sans-serif;
  font-size: 14px;
  appearance: none; /* Remove default styling */
}

.resetBtn {
  background-color: var(--button-bg-color);
  color: var(--text-color);
  border: 1px solid var(--button-bg-dark);
  border-radius: 3px;
  cursor: pointer;
  display: block;
  margin-top: 5px;
  padding: 5px;
  position: absolute;
  height: 50px;
  width: 100px;
  text-align: center;
  font-size: large;
  left: 25%;
}

.resetBtn:hover {
  background-color: var(--button-hover-bg-color);
  color: var(--text-color-light);
}

.btnGroup {
  display: grid;
  flex-wrap: wrap;
  min-width: 100%;
  width: 100%;
  max-width: 100%;
}

option {

  border-radius: 3px;
  cursor: pointer;
  display: block;
  font-size: 14px;
  margin: 2px 0;
  padding: 5px;
}

.btn:hover {
  background-color: var(--button-hover-bg-color);
  color: var(--text-color-light);
}

.textInput, select {
  width: 100%;
  margin: 0 auto;
  height: 30px;
  padding: 5px;
}

.checkboxGroup {
  align-items: center;
  display: flex;
  margin: 2px 0;
}

.checkbox {
  margin-right: 5px;
}

.checkboxLabel {
  margin-right: 10px;
}

.mapPlaceholder {
  border: 1px solid var(--border-color);
  color: var(--text-color-light);
  height: 200px;
  line-height: 200px;
  text-align: center;
  width: 100%;
}

.checkboxesWrapper {
  height: 300px;
  overflow-y: auto;
  position: relative;
}

.iconImg {
  cursor: pointer; /* Make the icons clickable */
  width: 50px;
}

.resetDefaults {
  display: inline;
  float: right;
}

.answered {
  color: var(--text-color-light);
  background: var(--background-color-dark);
}

.okBtn {
  background-color: var(--button-bg-color);
  color: var(--text-color);
  border: 1px solid var(--button-bg-dark);
}

.okBtn:disabled {
  border: 2px solid var(--text-color);
  background: var(--text-color-light);
}

.resetRow {
  height: 0;
  border: none;
}

.defaultAnswer {
  background-color: var(--accent-color); /* Choose your desired background color */
}

</style>