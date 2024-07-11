<script>
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
    addUserAnswer(answer) {
      console.log(this.userAnswers[this.userAnswers.length - 1]);
      this.userAnswers[this.userAnswers.length - 1].push(answer.text); // Ensure only text is pushed
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
      this.runStatus[jobIdPlaceholder] = { result: 'Sin iniciar', url: '' }; // Set initial status

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
      this.runStatus = { ...this.runStatus, [data.jobId]: { result: 'En la cola', url: '' } }; // Maintain initial status

      this.listenForJobCompletion(data.jobId);
    },
    listenForJobCompletion(jobId) {
      this.eventSource = new EventSource('http://localhost:3000/events'); // Ensure the URL is correct
      this.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Event received:', data);
        if (data.jobId === jobId) {
          // Directly update runStatus with result and url
          this.runStatus = { ...this.runStatus, [jobId]: { result: data.result, url: data.url } };
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

    <h1>Status</h1>
    <h2>Tus Datos</h2>
    <table>
      <tr>
        <td>Nombre:</td>
        <td>Jordi Brotons</td>
      </tr>
      <tr>
        <td>Organización:</td>
        <td>Colegio de Abogados de Barcelona</td>
      </tr>
    </table>
    <h2>Tus Colas</h2>
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
            <a v-if="runStatus[jobIds[index]].url" :href="runStatus[jobIds[index]].url" target="_blank">{{ runStatus[jobIds[index]].url }}</a>
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

</style>
