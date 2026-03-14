const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const ECOWITT_URL = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

async function actualizarDatos() {
  try {
    const response = await fetch(ECOWITT_URL);
    const data = await response.json();

    // Temperatura
    document.getElementById("tempBig").textContent = data.temp ?? "--";
    document.getElementById("sensacion").textContent = "Sensación térmica: " + (data.sensacion ?? "--");
    document.getElementById("tempMin").textContent = "Mínima diaria: " + (data.temp_min ?? "--");
    document.getElementById("tempMax").textContent = "Máxima diaria: " + (data.temp_max ?? "--");

    // Humedad
    document.getElementById("hum").textContent = data.hum ?? "--";

    // Viento
    document.getElementById("windValue").textContent = data.wind ?? "--";
    document.getElementById("windMax").textContent = "Racha máxima diaria: " + (data.wind_max ?? "--");
    document.getElementById("windDirText").textContent = "Dirección: " + (data.wind_dir ?? "--");

    // Rosa de los vientos: girar flecha
    const flecha = document.getElementById("flechaViento");
    if (data.wind_dir_deg != null) {
      flecha.style.transform = `rotate(${data.wind_dir_deg}deg)`;
    }

    // Lluvia
    document.getElementById("rain").textContent = data.rain ?? "--";
    document.getElementById("rainMonth").textContent = data.rain_month ?? "--";

    // Presión, UV y solar
    document.getElementById("press").textContent = data.press ?? "--";
    document.getElementById("uv").textContent = data.uv ?? "--";
    document.getElementById("solar").textContent = data.solar ?? "--";

    // Última actualización
    const now = new Date();
    document.getElementById("ultimaActualizacion").textContent = "Última actualización: " + now.toLocaleTimeString();

  } catch (error) {
    console.error("Error al obtener datos Ecowitt:", error);
  }
}

// Actualiza al cargar la página y cada minuto
actualizarDatos();
setInterval(actualizarDatos, 60000);
