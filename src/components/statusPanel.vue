<script>
import eventBus from "../eventBus.js";

export default {
  name: "statusPanel",
  data() {
    return {
      userAnswers: [[]],
      currentRunAnswer: [],
      runStatus: {},
      jobIds: [] // To store job IDs for each run
    };
  },
  computed: {
    filteredUserAnswers() {
      // Filter out empty arrays from userAnswers
      return this.userAnswers.filter(answers => answers.length > 0);
    }
  },
  methods: {
    handleUserAnswer(answer) {
      console.log('answer received:' + answer);
      let currentAnswers = this.userAnswers[this.userAnswers.length - 1];

      if (answer?.index < currentAnswers.length) { //Answer has been modified
        console.log(answer.index)
        currentAnswers[answer.index] = answer.text;
        currentAnswers.length = answer.index + 1;

      } else {
        currentAnswers.push(answer.text); // New Answer
      }
    },
    startNewRun() {
      this.startJob(this.userAnswers[this.userAnswers.length - 1]);
      this.userAnswers.push([]);
      console.log(this.userAnswers);
      this.currentRunAnswer = [];
    },
    async startJob(userAnswers) {
      const jobIdPlaceholder = 'pending_' + new Date().getTime();
      this.jobIds.push(jobIdPlaceholder);
      this.runStatus[jobIdPlaceholder] = {result: 'Sin iniciar', url: ''}; // Set initial status

      const response = await fetch('http://localhost:3000/start-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userAnswers) // Send JSON body
      });
      const data = await response.json();
      console.log('Job started with ID:', data.jobId);

      // Replace the placeholder jobId with the actual jobId
      const index = this.jobIds.indexOf(jobIdPlaceholder);
      if (index !== -1) {
        this.jobIds.splice(index, 1, data.jobId);
      }
      this.runStatus = {...this.runStatus, [data.jobId]: {result: 'En la cola', url: ''}}; // Maintain initial status

      this.listenForJobCompletion(data.jobId);
    },
    listenForJobCompletion(jobId) {
      this.eventSource = new EventSource('http://localhost:3000/events'); // Ensure the URL is correct
      this.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Event received:', data);
        eventBus.emit('newNotification', `Parece que hemos encontrado ${data.result} que necesitas. Pulsa <a href="${data.url}" target="_blank">aquí </a> para acceder a ella.`);
        if (data.jobId === jobId) {
          // Directly update runStatus with result and url
          this.runStatus = {...this.runStatus, [jobId]: {result: data.result, url: data.url}};
          this.eventSource.close();
        }
      };
      this.eventSource.onerror = () => {
        console.error('EventSource failed.');
        this.eventSource.close();
      };
    },
  },
  beforeDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
</script>

<template>
  <main ref="statusPanel" class="statusPanel">
    <h1>SILB.io</h1>
    <img class="silbIcon" src="../assets/silb_icon.png" alt="Stand In Line Bot"/>
    <h2>Stand In Line Bot</h2>
    <h3>Usuario</h3>
    <p id="userId">Jordi Brotons <br> Colegio de Abogados de Barcelona</p>
    <h3>Tus Colas</h3>
    <table class="jobTable">
      <thead>
      <tr>
        <th>Answers</th>
        <th>Result</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(answers, index) in filteredUserAnswers" :key="index">
        <td>
          <table class="answersTable">
            <tr v-for="(answer, answerIndex) in answers" :key="answerIndex">
              <td>{{ answer }}</td>
            </tr>
          </table>
        </td>
        <td>
          <div v-if="runStatus[jobIds[index]]">
            <div>{{ runStatus[jobIds[index]].result }}</div>
            <a v-if="runStatus[jobIds[index]].url" :href="runStatus[jobIds[index]].url"
               target="_blank">{{ runStatus[jobIds[index]].url }}</a>
          </div>
          <div v-else>Sin iniciar</div>
        </td>
      </tr>
      </tbody>
    </table>
  </main>
</template>

<style scoped>
.hidden {
  display: none;
}

h1, h2, h3 {
  color: gold;
  text-shadow: 1px 1px #1a1a1a;
  text-align: center;
}

h1, h2 {
  margin: 0;
}

h3 {
  padding-top: 10px;
  border-top: 1px solid gold;
  width: 100%;
  margin-bottom: 5px;
}


.statusPanel {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: scroll;
}

.jobTable, .answersTable {
  width: 100%;
  border-collapse: collapse;
}

.jobTable th, .jobTable td, .answersTable th, .answersTable td {
  border: 2px solid yellow;
  padding: 8px;
  text-align: left;
}

.jobTable th {
  background-color: yellow;
  color: black;
}

.answersTable {
  background: #cbcbcb;
  color: black;
}

.answersTable td {
  border: 1px solid yellow;
  padding: 5px;
  margin: 5px;
}

.silbIcon {
  margin: 0 auto;
  height: 240px;
  width: 240px;
}

#userId {
  text-align: left;
  padding-left: 10px;
}
</style>
