<template>
  <main class="statusPanel">
    <h1>SILB.io</h1>
    <img class="silbIcon" src="../assets/icons/silb_icon.png" alt="Stand In Line Bot"/>
    <h2>Stand In Line Bot</h2>
    <h3>Usuario</h3>
    <table id="userDetails">
      <tr>
        <td>Nombre:</td>
        <td>{{ userDetails.name }}</td>
      </tr>
      <tr>
        <td>Organización:</td>
        <td>{{ userDetails.org }}</td>
      </tr>
    </table>
    <h3>Tus Colas</h3>
    <table class="jobTable">
      <thead>
      <tr>
        <th>Trámite</th>
        <th>Estado</th>
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
<script>


export default {
  name: "statusPanel",
  data() {
    return {
      userAnswers: [[]],
      runStatus: {},
      jobIds: [],
      userDetails: {}
    };
  },
  computed: {
    filteredUserAnswers() {
      // Filter out empty arrays from userAnswers

      return this.userAnswers.filter(answers => answers.length > 0).reverse();
    }
  },
  mounted() {
    //TODO => Persist status panel between mode changes.
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const decodedTokenString = atob(token);

    this.userDetails = JSON.parse(decodedTokenString);
  },
  methods: {
    resetUserAnswers() {
      this.userAnswers = [];
    },
    resetCurrentRun() {
      this.userAnswers[0] = [];
    },
    handleUserAnswer(answer) {

      let currentAnswers = this.userAnswers[0];
      if (answer.index < currentAnswers.length) {
        currentAnswers[answer.index] = answer.text; // Replace the answer
      } else {
        currentAnswers.push(answer.text); // Add new answer

      }
    },
    startNewRun(isRestart) {
      console.log('User answers at run start', this.userAnswers);
      if (isRestart) {
        this.resetCurrentRun();
      } else {
        const filteredArray = this.userAnswers.filter(arr => arr.length > 0);
        filteredArray.unshift([]);
        this.userAnswers = filteredArray;
      }
    },
    async startJob() {
      //Summarize panel
      let answersTable = document.getElementsByClassName('answersTable')[this.userAnswers.length - 1]
      answersTable.innerHTML = answersTable.lastElementChild.outerHTML;
      answersTable.classList.add('locked');

      const jobIdPlaceholder = 'pending_' + new Date().getTime();
      this.jobIds.push(jobIdPlaceholder);
      this.runStatus[jobIdPlaceholder] = {result: 'Sin iniciar', url: ''}; // Set initial status

      const response = await fetch('http://localhost:3000/start-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.userAnswers[this.userAnswers.length - 1]) // Send JSON body
      });
      const data = await response.json();


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

        this.$eventBus.emit('newNotification', `Parece que hemos encontrado ${data.result} que necesitas. Pulsa <a href="${data.url}" target="_blank">aquí </a> para acceder a ella.`);
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
<style scoped>
.statusPanel {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  position: relative;
  height: 100vh; /* Full height of the viewport */
  width: 100%;
}

.jobTable {
  margin: 5px;
  border: 1px solid var(--border-color);
  flex-grow: 1; /* Allow jobTable to grow and shrink */
  overflow: hidden; /* Prevent overflow outside of the container */
  display: flex;
  flex-direction: column; /* Make the tbody take available space */
  border-collapse: collapse;
}

.jobTable tbody {
  display: block;
  overflow-y: scroll; /* Enable vertical scrolling */
  flex-grow: 1; /* Allow tbody to grow and fill the space */
}

.jobTable thead, .jobTable tbody {
  width: 100%; /* Ensure thead and tbody take full width */
}

.jobTable th, .jobTable td {
  border: 2px solid var(--border-color);
  padding: 8px;
  text-align: left;
}

.jobTable th:first-child, .jobTable td:first-child {
  width: 90%;
}

.jobTable th:last-child, .jobTable td:last-child {
  width: 10%;
}

.jobTable th {
  background-color: var(--background-color-light);
  color: var(--secondary-color);
}

.answersTable {
  background: var(--background-color);
  color: var(--text-color);
  border-collapse: collapse;
}

.answersTable td {
  border: 1px solid var(--border-color);
  padding: 5px;
  margin: 5px;
}

.silbIcon {
  width: 30%;
}

.locked {
  border: 3px solid var(--border-color);
}

#userDetails {
  text-align: left;
}


h1, h2 {
  margin: 0 10px;
  text-align: left;
}

h3 {
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
  width: 100%;
  margin-bottom: 5px;
}
</style>
