const WORKER_URL = "https://tiempo-cosuenda-worker.workers.dev/data";

async function actualizarDatos() {
  try {
    const response = await fetch(WORKER_URL);
    const json = await response.json();

    const data = json.data?.["84:CC:A8:B4:B1:F6"] ?? {};

    document.getElementById("tempBig").textContent = data.temp ?? "--";
    document.getElementById("sensacion").textContent = "Sensación térmica: " + (data.feels_like ?? "--");
    document.getElementById("tempMin").textContent = "Mínima diaria: " + (data.temp_day_min ?? "--");
    document.getElementById("tempMax").textContent = "Máxima diaria: " + (data.temp_day_max ?? "--");

    document.getElementById("hum").textContent = data.humidity ?? "--";

    document.getElementById("windValue").textContent = data.wind_speed ?? "--";
    document.getElementById("windMax").textContent = "Racha máxima diaria: " + (data.wind_gust ?? "--");
    document.getElementById("windDirText").textContent = "Dirección: " + (data.wind_deg ?? "--");

    const flecha = document.getElementById("flechaViento");
    if (data.wind_deg !== undefined) flecha.style.transform = `rotate(${data.wind_deg}deg)`;

    document.getElementById("rain").textContent = data.rain_24h ?? "--";
    document.getElementById("rainMonth").textContent = data.rain_month ?? "--";

    document.getElementById("press").textContent = data.pressure ?? "--";
    document.getElementById("uv").textContent = data.uv_index ?? "--";
    document.getElementById("solar").textContent = data.solar_radiation ?? "--";

    const now = new Date();
    document.getElementById("ultimaActualizacion").textContent = "Última actualización: " + now.toLocaleTimeString();

  } catch (error) {
    console.error("Error al obtener datos del Worker:", error);
  }
}

actualizarDatos();
setInterval(actualizarDatos, 60000);
