const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

// Conversión de unidades
const fToC = f => (parseFloat(f) - 32) * 5 / 9;
const mphToKmh = mph => parseFloat(mph) * 1.60934;
const inToMm = inches => parseFloat(inches) * 25.4;
const inHgToHpa = inHg => parseFloat(inHg) * 33.8639;

// Dirección
function gradosADireccion(g){
  const d=["N","NE","E","SE","S","SW","W","NW"];
  return d[Math.round(g/45)%8];
}

// Actualiza datos visuales
async function obtenerDatos(){
  try {
    const response = await fetch(url);
    const json = await response.json();
    if(!json || json.code !== 0) return;

    const data = json.data.data; // <<< **IMPORTANTE**

    const o = data.outdoor;
    const w = data.wind;
    const rain = data.rainfall;
    const p = data.pressure;
    const uv = data.solar_and_uvi.uvi.value ?? "--";
    const solar = data.solar_and_uvi.solar.value ?? "--";

    // Temperatura
    const tempC = fToC(o.temperature.value);
    const feels = fToC(o.feels_like.value);

    document.getElementById("tempBig").textContent = tempC.toFixed(1)+"°";
    document.getElementById("sensacion").textContent = "Sensación térmica: "+feels.toFixed(1)+"°";
    document.getElementById("tempMin").textContent = "Mínima diaria: --";
    document.getElementById("tempMax").textContent = "Máxima diaria: --";

    // Humedad
    document.getElementById("hum").textContent = o.humidity.value+"%";

    // Viento
    const windKm = mphToKmh(w.wind_speed.value);
    document.getElementById("windValue").textContent = windKm.toFixed(1)+" km/h";
    document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(w.wind_direction.value);

    // Racha máxima
    document.getElementById("windMax").textContent = "Racha máxima diaria: "+mphToKmh(w.wind_gust.value).toFixed(1)+" km/h";

    // Lluvia
    const rainMm = inToMm(rain.daily.value);
    const rainMonthMm = inToMm(rain.monthly.value);
    document.getElementById("rain").textContent = rainMm.toFixed(1);
    document.getElementById("rainMonth").textContent = rainMonthMm.toFixed(1);

    // Presión
    document.getElementById("press").textContent = inHgToHpa(p.relative.value).toFixed(1);

    // UV y solar
    document.getElementById("uv").textContent = uv;
    document.getElementById("solar").textContent = solar;

    // Última actualización
    const now = new Date();
    document.getElementById("ultimaActualizacion").textContent = "Última actualización: "+now.toLocaleTimeString();

  } catch (e) {
    console.error("Error actualizando datos:", e);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 120000);
