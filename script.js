// ================================
// script.js final para Meteo Cosuenda
// ================================

// URL de tu Worker
const WORKER_URL = "https://TU_WORKER.workers.dev/data";

// Funciones de conversión
const fToC = f => (f !== null ? ((f - 32) * 5/9).toFixed(1) : "--");
const inToMm = i => (i !== null ? (i * 25.4).toFixed(1) : "--");
const mphToKmh = m => (m !== null ? (m * 1.60934).toFixed(1) : "--");

// Campos que vamos a actualizar
const campos = {
  tempBig: "tempf",
  sensacion: "feelslike",
  tempMin: "tempmin",
  tempMax: "tempmax",
  hum: "humidity",
  windValue: "windspeedmph",
  windMax: "windgustmph",
  windDirText: "winddir",
  rain: "rainin",
  rainMonth: "rainMonth",
  press: "baromrelin",
  uv: "uv",
  solar: "solarradiation"
};

// Función principal
async function actualizarDatos() {
  try {
    const res = await fetch(WORKER_URL);
    const data = await res.json();

    // Temperatura
    document.getElementById("tempBig").textContent = fToC(data.tempf) + "°C";
    document.getElementById("sensacion").textContent = "Sensación térmica: " + fToC(data.feelslike) + "°C";
    document.getElementById("tempMin").textContent = "Mínima diaria: " + fToC(data.tempmin) + "°C";
    document.getElementById("tempMax").textContent = "Máxima diaria: " + fToC(data.tempmax) + "°C";

    // Humedad
    document.getElementById("hum").textContent = data.humidity ?? "--";

    // Viento
    document.getElementById("windValue").textContent = mphToKmh(data.windspeedmph);
    document.getElementById("windMax").textContent = "Racha máxima diaria: " + mphToKmh(data.windgustmph);
    document.getElementById("windDirText").textContent = "Dirección: " + (data.winddir ?? "--");

    // Rotar flecha según dirección del viento
    if (data.winddir !== undefined && data.winddir !== null) {
      const flecha = document.getElementById("flechaViento");
      flecha.style.transform = `rotate(${data.winddir}deg)`;
    }

    // Lluvia
    document.getElementById("rain").textContent = inToMm(data.rainin) + " mm";
    document.getElementById("rainMonth").textContent = inToMm(data.rainMonth) + " mm";

    // Presión
    document.getElementById("press").textContent = data.baromrelin ?? "--";

    // UV y radiación solar
    document.getElementById("uv").textContent = data.uv ?? "--";
    document.getElementById("solar").textContent = data.solarradiation ?? "--";

    // Última actualización
    const ahora = new Date();
    document.getElementById("ultimaActualizacion").textContent = "Última actualización: " + ahora.toLocaleTimeString();

  } catch (err) {
    console.error("Error actualizando datos:", err);
  }
}

// Ejecutar al cargar
actualizarDatos();

// Refrescar cada minuto
setInterval(actualizarDatos, 60000);
