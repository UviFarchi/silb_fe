<script>
import conversation from '../assets/conversation.js';
import eventBus from '../eventBus.js';

export default {
  computed: {
    eventBus() {
      return eventBus;
    },
  },
  data() {
    return {
      steps: conversation.steps,
      componentKey: 0,
      selectedOptions: {},
      answers: {},
      defaultAnswers: {}, // Added to store default answers
      visibleIndexes: [], // Track visible indexes
    };
  },
  mounted() {
    this.loadDefaultAnswers();
  },
  methods: {
    recordAnswer(answer, index) {
      const newAnswers = { ...this.answers };
      const newSelectedOptions = { ...this.selectedOptions };

      Object.keys(this.answers).forEach((key) => {
        if (parseInt(key) > index) {
          delete newAnswers[key];
          delete newSelectedOptions[key];
        }
      });

      this.answers = { ...newAnswers, [index]: answer };
      this.selectedOptions = newSelectedOptions;

      console.log('Answer recorded:', answer, 'for index:', index);
      this.emitAnswer(index);

      // Save answer as default if the default checkbox is checked
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    },
    resetForm() {
      eventBus.emit('startNewRun', true);
      this.componentKey += 1;
      this.selectedOptions = {};
      this.answers = {};
      this.visibleIndexes = [];
    },
    handleDefault() {},
    selectAll(options, index) {
      this.selectedOptions = { ...this.selectedOptions, [index]: [...options] };
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }
    },
    deselectAll(index) {
      this.selectedOptions = { ...this.selectedOptions, [index]: [] };
      if (this.defaultDefaults[index] !== undefined) {
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
      if (!this.selectedOptions[index]) {
        this.selectedOptions = { ...this.selectedOptions, [index]: [] };
      }

      const selected = this.selectedOptions[index];
      if (event.target.checked) {
        selected.push(option);
      } else {
        const optionIndex = selected.indexOf(option);
        if (optionIndex > -1) {
          selected.splice(optionIndex, 1);
        }
      }

      this.selectedOptions = { ...this.selectedOptions, [index]: selected };

      // Save answer as default if the default checkbox is checked
      if (this.defaultAnswers[index] !== undefined) {
        this.saveDefaultAnswers();
      }

      this.emitAnswer(index);
    },
    toggleDefault(index, event) {
      if (event.target.checked) {
        this.defaultAnswers = { ...this.defaultAnswers, [index]: this.answers[index] };
      } else {
        const newDefaultAnswers = { ...this.defaultAnswers };
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
        // this.answers = {...this.answers, ...this.defaultAnswers };

        // Ensure selectedOptions is updated correctly for checkbox-type inputs
        for (const [index, answer] of Object.entries(this.defaultAnswers)) {
          this.selectedOptions[index] = answer;
        }
      }
    },
    emitAnswer(index) {
      const answer = this.answers[index];
      if (Array.isArray(answer)) {
        answer.forEach((a) => eventBus.emit('updateUserAnswers', { text: a, index }));
      } else {
        eventBus.emit('updateUserAnswers', { text: answer, index });
      }
    },
    clearDefaults() {
      this.defaultAnswers = {};
      this.saveDefaultAnswers();
    },
  },
};
</script>
<template>
  <div class="chatStream" :key="componentKey">
    <table class="compactTable">
      <thead>
      <tr>
        <th class="questionText">Question</th>
        <th class="answerResponse">Answer</th>
        <th class="defaultCheckbox">
          <img src="../assets/default.png" alt="Default" class="iconImg"/>
          <button @click="clearDefaults" class="resetBtn iconImg">⟳</button>
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
        <td class="questionText">{{ step.short || step.text }}</td>
        <td class="answerResponse">
          <div v-if="step.options.type === 'buttons'" class="btnGroup">
            <select @change="recordAnswer($event.target.value, index)" v-model="selectedOptions[index]">
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
                @change="recordAnswer($event.target.value, index)"
                v-model="selectedOptions[index]"
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
                  :checked="selectedOptions[index] && selectedOptions[index].includes(option)"
              />
              <label :for="'checkbox-' + index + '-' + idx" class="checkboxLabel">{{ option }}</label>
            </div>
          </div>
          <div v-if="step.options.type === 'dropdown' || (step.options.type === 'map' && step.options.expert)">
            <select class="dropdown" @change="recordAnswer($event.target.value, index)"
                    v-model="selectedOptions[index]">
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
        <td class="defaultCheckbox">
          <label>
            <img
                v-if="defaultAnswers[index] !== undefined"
                src="../assets/lock.png"
                alt="Lock"
                class="iconImg"
            />
            <button v-if="defaultAnswers[index]!==undefined && step.options.type !== 'checkbox'" @click="recordAnswer(defaultAnswers[index], index)">OK</button>
            <img
                v-else
                src="../assets/unlock.png"
                alt="Unlock"
                class="iconImg"
            />
            <input
                type="checkbox"
                @change="toggleDefault(index, $event)"
                :checked="defaultAnswers[index] !== undefined"
                style="display: none;"
            />
          </label>
          <div v-if="step.options.type === 'checkbox'">
            <button @click="selectAll(step.options.content, index)" title="Seleccionar Todas">
              <img src="../assets/select_all.png" alt="Seleccionar Todas" class="iconImg"/>
            </button>
            <button @click="deselectAll(index)" title="No Seleccionar Ninguna">
              <img src="../assets/select_none.png" alt="No Seleccionar Ninguna" class="iconImg"/>
            </button>
            <button @click="recordAnswer(selectedOptions[index], index)" title="Confirmar Selección">Seleccionar</button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
* {
  font-size: 14px;
  color: #333;
  font-family: Arial, sans-serif;
  text-align: left;
  box-sizing: border-box;
}

select, option, optgroup {
  font-size: 14px;
  color: #333;
  font-family: Arial, sans-serif;
  text-align: left;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 5px;
}

select {
  max-width: 100%;
  appearance: none; /* Remove default styling */
}

.chatStream {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
}

.compactTable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Ensures the table has a fixed layout */
}

thead th {
  padding: 10px;
  text-align: left;
  background-color: #f2f2f2;
  width: auto; /* Ensure width can be overridden */
}

tbody tr {
  border-bottom: 1px solid #ccc;
}

td, th {
  border: 1px solid #ccc;
  padding: 5px;
  vertical-align: top;
  word-wrap: break-word;
  box-sizing: border-box; /* Ensure padding and border are included in width */
}

th.questionText, td.questionText {
  width: 25% !important; /* Added !important to enforce the width */
  overflow: hidden; /* Ensure text does not overflow */
}

th.answerResponse, td.answerResponse {
  width: 65% !important; /* Added !important to enforce the width */
  overflow: hidden; /* Ensure text does not overflow */
}

th.defaultCheckbox, td.defaultCheckbox {
  width: 10% !important; /* Added !important to enforce the width */
  overflow: hidden; /* Ensure text does not overflow */
}

.resetBtn {
  display: block;
  margin-top: 5px;
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.resetBtn:hover {
  background-color: #e9e9e9;
}

.btnGroup {
  display: flex;
  flex-wrap: wrap;
}

.btn, .textInput, .dropdown {
  display: block;
  margin: 2px 0;
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.btn:hover {
  background-color: #e9e9e9;
}

.textInput {
  width: calc(100% - 12px);
}

.checkboxGroup {
  display: flex;
  align-items: center;
  margin: 2px 0;
}

.checkbox {
  margin-right: 5px;
}

.checkboxLabel {
  margin-right: 10px;
}

.dropdown {
  width: calc(100% - 12px);
}

.mapPlaceholder {
  width: 100%;
  height: 200px;
  background-color: #eee;
  text-align: center;
  line-height: 200px;
  color: #666;
  border: 1px solid #ccc;
}

.checkboxesWrapper {
  height: 150px;
  overflow-y: auto;
  position: relative;
}

.iconImg {
  width: 50px;
  cursor: pointer; /* Make the icons clickable */
}
</style>