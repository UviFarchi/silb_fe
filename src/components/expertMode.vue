<template>
  <div class="chatStream">
    <table class="compactTable">
      <thead>
      <tr>
        <th>Message</th>
        <th>Response</th>
        <th>Default</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(step, index) in steps.filter(step=> step.options.type !== 'info')" :key="index" class="messageRow">
        <td class="messageText">{{ step.short || step.text }}</td>
        <td class="messageResponse">
          <div v-if="step.options.type === 'buttons'" class="btnGroup">
            <button v-for="(option, idx) in step.options.content" :key="idx" class="btn" @click="recordAnswer(step.text, option)">{{ option }}</button>
          </div>
          <div v-if="step.options.type === 'text'">
            <input type="text" class="textInput" @change="recordAnswer(step.text, $event.target.value)" />
          </div>
          <div v-if="step.options.type === 'checkbox'">
            <div v-for="(option, idx) in step.options.content" :key="idx" class="checkboxGroup">
              <input type="checkbox" :id="'checkbox-' + idx" class="checkbox" @change="recordAnswer(step)" />
              <label :for="'checkbox-' + idx" class="checkboxLabel">{{ option }}</label>
            </div>
            <button class="btn">Select All</button>
            <button class="btn">Deselect All</button>
            <button class="btn">Invert Selection</button>
          </div>
          <div v-if="step.options.type === 'dropdown' || (step.options.type === 'map' && step.options.expert)">
            <select class="dropdown" @change="recordAnswer(step)">
              <template v-for="(category, idx) in (step.options.type === 'dropdown' ?  step.options.content : step.options.expert)" :key="idx">
                <optgroup :label="category.text">
                  <option v-for="option in category.options" :key="option">{{ option }}</option>
                </optgroup>
              </template>
            </select>
          </div>
          <div v-if="(step.options.type === 'map' && !step.options.expert)">
            <div class="mapPlaceholder">No hay información</div>
          </div>
                 </td>
        <td class="defaultCheckbox">
          <input type="checkbox"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import conversation from '../assets/conversation.js';
import eventBus from "../eventBus.js";

export default {
  data() {
    return {
      steps: conversation.steps,
      userAnswers: [],
      defaultAnswers: {}
    };
  },
  methods: {
    recordAnswer(step) {
      eventBus.emit('updateUserAnswers', step);
        }
  }
};

</script>

<style scoped>
.chatStream {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
  font-family: Arial, sans-serif;
}

.compactTable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

td, th {
  border: 1px solid #ccc;
  padding: 5px;
  vertical-align: top;
}

.messageRow {
  margin-bottom: 5px;
}

.messageText, .defaultCheckbox {
  width: 30%;
  padding-right: 5px;
}

.messageResponse {
  width: 50%;
}

.btnGroup {
  display: flex;
  flex-wrap: wrap;
}

.btn, .textInput, .dropdown, .resetBtn {
  display: block;
  margin: 2px 0;
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #f9f9f9;
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
</style>

