// script.js — Conexión directa con Ecowitt Cloud

const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const ECOWITT_URL = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

async function actualizarDatos() {
  try {
    const response = await fetch(ECOWITT_URL);
    const json = await response.json();

    // Extracción de datos según estructura de Ecowitt
    const data = json.data?.[mac] ?? {};

    // Temperatura
    document.getElementById("tempBig").textContent = data.temp ?? "--";
    document.getElementById("sensacion").textContent = "Sensación térmica: " + (data.feels_like ?? "--");
    document.getElementById("tempMin").textContent = "Mínima diaria: " + (data.temp_day_min ?? "--");
    document.getElementById("tempMax").textContent = "Máxima diaria: " + (data.temp_day_max ?? "--");

    // Humedad
    document.getElementById("hum").textContent = data.humidity ?? "--";

    // Viento
    document.getElementById("windValue").textContent = data.wind_speed ?? "--";
    document.getElementById("windMax").textContent = "Racha máxima diaria: " + (data.wind_gust ?? "--");
    document.getElementById("windDirText").textContent = "Dirección: " + (data.wind_deg ?? "--");

    // Rosa de los vientos: girar flecha según grados
    const flecha = document.getElementById("flechaViento");
    if (data.wind_deg !== undefined) {
      flecha.style.transform = `rotate(${data.wind_deg}deg)`;
    }

    // Lluvia
    document.getElementById("rain").textContent = data.rain_24h ?? "--";
    document.getElementById("rainMonth").textContent = data.rain_month ?? "--";

    // Presión, UV y solar
    document.getElementById("press").textContent = data.pressure ?? "--";
    document.getElementById("uv").textContent = data.uv_index ?? "--";
    document.getElementById("solar").textContent = data.solar_radiation ?? "--";

    // Última actualización
    const now = new Date();
    document.getElementById("ultimaActualizacion").textContent = "Última actualización: " + now.toLocaleTimeString();

  } catch (error) {
    console.error("Error al obtener datos Ecowitt:", error);
  }
}

// Ejecutar al cargar y cada minuto
actualizarDatos();
setInterval(actualizarDatos, 60000);
