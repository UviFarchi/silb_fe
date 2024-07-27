<script>
export default {
  name: "helpMode"
}
</script>

<template>
  <header>
    <h1>Instrucciones de Uso de la Aplicación</h1>
  </header>
  <main class="container">
    <section class="section">
      <h2>Panel de Estado</h2>
      <p>En esta sección se muestra el estado actual de la aplicación. Aquí puedes verificar si hay algún problema o si todo está funcionando correctamente.</p>
    </section>
    <section class="section">
      <h2>Control de Modo</h2>
      <p>Utiliza esta sección para cambiar entre los diferentes modos de la aplicación. Cada modo ofrece funcionalidades específicas adaptadas a distintas necesidades.</p>
    </section>
    <section class="section">
      <h2>Modo de Ayuda</h2>
      <p>Si necesitas ayuda o instrucciones sobre cómo utilizar la aplicación, dirígete a esta sección. Aquí encontrarás guías y respuestas a preguntas frecuentes.</p>
    </section>
    <section class="section">
      <h2>Modo Experto</h2>
      <p>Esta sección está diseñada para usuarios avanzados. Ofrece características y configuraciones adicionales para un uso más avanzado de la aplicación.</p>
    </section>
    <section class="section">
      <h2>Modo de Chat</h2>
      <p>Utiliza esta sección para interactuar a través del chat. Puedes comunicarte con otros usuarios o recibir asistencia en tiempo real.</p>
    </section>
    <section class="section">
      <h2>Panel de Animación</h2>
      <p>En esta sección puedes ver las animaciones. Es ideal para visualizar datos de una manera más dinámica y atractiva.</p>
    </section>
  </main>
  <footer>
    <p>&copy; 2024 silb.io. Todos los derechos reservados.</p>
  </footer>
</template>

<style scoped>
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}
.container {
  width: 80%;
  margin: auto;
  overflow: hidden;
}
header {
  background: #333;
  color: #fff;
  padding-top: 30px;
  min-height: 70px;
  border-bottom: #0779e4 3px solid;
}
header h1 {
  text-align: center;
  text-transform: uppercase;
  margin: 0;
}
main {
  padding: 20px;
  background: #f4f4f4;
}
footer {
  background: #333;
  color: #fff;
  text-align: center;
  padding: 10px 0;
  margin-top: 20px;
}
.section {
  margin-bottom: 20px;
}
.section h2 {
  color: #333;
}
</style>