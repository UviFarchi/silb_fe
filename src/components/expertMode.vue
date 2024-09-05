<template>
  <div class="expertWrapper" :key="componentKey">
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
      >
        <td class="questionCell">{{ step.short || step.text }}</td>
        <td class="answerCell">
          <div v-if="step.options.type === 'buttons'" class="btnGroup">
            <select @change="recordAnswer($event.target, $event.target.value, index)" v-model="selectedAnswers[index]">
              <option disabled value="">elija uno</option>
              <option
                  v-for="(option, idx) in step.options.content"
                  :key="idx"
                  class="btn"
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
                  <option v-for="option in category.options" :key="option">{{ option }}</option>
                </optgroup>
              </template>
            </select>
          </div>
          <div v-if="step.options.type === 'map' && !step.options.expert">
            <div class="mapPlaceholder">No hay información</div>
          </div>
          <div v-if="step.options.type === 'reset'">
            <button @click="resetForm">{{ step.short }}</button>
          </div>
        </td>
        <td class="defaultCell">

          <input
              type="checkbox"
              @change="toggleDefault(index, $event)"
              :checked="defaultAnswers[index] !== undefined"
          />

          <i v-if="defaultAnswers[index] !== undefined && answers[index] !== undefined && answers[index] !== defaultAnswers[index]">La
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
              v-else-if=" step.options.type === 'checkbox' && !answers[index]"
              class="okBtn"
              @click="recordAnswer($event.target, selectedAnswers[index], index)">OK
          </button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content">
        <p>¿Estás seguro de que deseas restablecer todas las respuestas predeterminadas?</p>
        <button @click="confirmClearDefaults(true)">Aceptar</button>
        <button @click="confirmClearDefaults(false)">Cancelar</button>
      </div>
    </div>
  </div>
</template>
<script>
import conversation from '../assets/conversation.js';


export default {
  data() {
    return {
      steps: conversation.steps,
      componentKey: 0,
      selectedAnswers: {},
      answers: {},
      defaultAnswers: {},
      visibleIndexes: [],
    };
  },
  mounted() {
    console.log('Mounting Expert mode')
    this.loadDefaultAnswers();
    this.$eventBus.emit('startNewRun', true);
  },
  methods: {
    recordAnswer(target, answer, index) {
      target.closest('tr').classList.add('answered');
      const newAnswers = {...this.answers};
      const newSelectedOptions = {...this.selectedAnswers};

      Object.keys(this.answers).forEach((key) => {
        if (parseInt(key) > index) {
          delete newAnswers[key];
          delete newSelectedOptions[key];
        }
      });

      this.answers = {...newAnswers, [index]: answer};
      this.selectedAnswers = newSelectedOptions;

      console.log('Answer recorded:', answer, 'for index:', index);
      this.emitAnswer(index);

      // Save answer as default if the default checkbox is checked
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    },
    resetForm() {
      this.$eventBus.emit('runCompleted', '');
      this.$eventBus.emit('startNewRun', true);
      this.componentKey += 1;
      this.selectedAnswers = {};
      this.answers = {};
      this.visibleIndexes = [];
      this.loadDefaultAnswers();
    },
    handleDefault() {
    },
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

      this.selectedAnswers = {...this.selectedAnswers, [index]: selected};

      // Save answer as default if the default checkbox is checked
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }

      this.emitAnswer(index);
    },
    toggleDefault(index, event) {
      if (event.target.checked) {
        this.defaultAnswers = {...this.defaultAnswers, [index]: this.answers[index]};
      } else {
        const newDefaultAnswers = {...this.defaultAnswers};
        delete newDefaultAnswers[index];
        this.defaultAnswers = newDefaultAnswers;
      }
      this.saveDefaultAnswers();
    },
    saveDefaultAnswers() {
      localStorage.setItem('defaultAnswers', JSON.stringify(this.defaultAnswers));
    },
    loadDefaultAnswers() {
      const savedDefaults = localStorage.getItem('defaultAnswers');
      if (savedDefaults) {
        this.defaultAnswers = JSON.parse(savedDefaults);

        // Ensure selectedAnswers is updated correctly for checkbox-type inputs
        for (const [index, answer] of Object.entries(this.defaultAnswers)) {
          this.selectedAnswers[index] = answer;
        }
      }
    },
    emitAnswer(index) {
      const answer = this.answers[index];
      if (Array.isArray(answer)) {
        answer.forEach((a) => this.$eventBus.emit('updateUserAnswers', {text: a, index}));
      } else {
        this.$eventBus.emit('updateUserAnswers', {text: answer, index});
      }
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
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 14px;
  text-align: left;
}

.expertWrapper {
  height: 100%; /* Adjust this height as needed */
  overflow-y: scroll;
}


/* styles.css */
table {
  width: 100%;
}

thead, tbody {

}

thead {
  position: sticky;
  top: 0;
  background: lightgoldenrodyellow;
}

tr {

}

th, td {
  border: 1px dotted dimgrey;
  border-collapse: collapse;
  margin: 0;
}


tbody {

}


select, option, optgroup {
  border-radius: 3px;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 14px;
  padding: 5px;
  text-align: left;
}

select {
  appearance: none; /* Remove default styling */
  max-width: 100%;
}

.resetBtn {
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  display: block;
  font-size: 12px;
  margin-top: 5px;
  padding: 5px;
}

.resetBtn:hover {
  background-color: #e9e9e9;
}

.btnGroup {
  display: flex;
  flex-wrap: wrap;
}

.btn, .textInput, .dropdown {
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  display: block;
  font-size: 14px;
  margin: 2px 0;
  padding: 5px;
}

.btn:hover {
  background-color: #e9e9e9;
}

.textInput, .dropdown {
  width: calc(100% - 12px);
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
  border: 1px solid #ccc;
  color: #666;
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
  color: grey;
  background: lightgrey;
}

.okBtn {
  border: 2px solid yellow;
}

.okBtn:disabled {
  border: 2px solid black;
  background: grey;
}
</style>
