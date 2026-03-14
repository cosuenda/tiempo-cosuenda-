const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

// Conversión de unidades
const fToC = f => f !== undefined ? (parseFloat(f) - 32) * 5 / 9 : "--";
const mphToKmh = mph => mph !== undefined ? parseFloat(mph) * 1.60934 : "--";
const inToMm = inches => inches !== undefined ? parseFloat(inches) * 25.4 : "--";
const inHgToHpa = inHg => inHg !== undefined ? parseFloat(inHg) * 33.8639 : "--";

// Dirección del viento
function gradosADireccion(g){
  const d=["N","NE","E","SE","S","SW","W","NW"];
  return g !== undefined ? d[Math.round(g/45)%8] : "--";
}

// Función para asignar clase de color según temperatura
function claseTemperatura(tempC){
  if(tempC === null || tempC === "--") return "";
  if(tempC < 10) return "temp-cold";
  if(tempC < 25) return "temp-medium";
  return "temp-hot";
}

// Día actual para reiniciar min/max
let diaActual = new Date().getDate();

// Cargar min y max del día desde localStorage
let tempMinDia = parseFloat(localStorage.getItem("tempMinDia")) || null;
let tempMaxDia = parseFloat(localStorage.getItem("tempMaxDia")) || null;

async function obtenerDatos(){
  try {
    const response = await fetch(url);
    const json = await response.json();
    if(!json || json.code !== 0) return;

    const data = json.data.data;

    const o = data?.outdoor ?? {};
    const w = data?.wind ?? {};
    const rain = data?.rainfall ?? {};
    const p = data?.pressure ?? {};
    const uv = data?.solar_and_uvi?.uvi?.value ?? "--";
    const solar = data?.solar_and_uvi?.solar?.value ?? "--";

    // Reiniciar si cambia el día
    const hoy = new Date().getDate();
    if(hoy !== diaActual){
      diaActual = hoy;
      tempMinDia = null;
      tempMaxDia = null;
      localStorage.removeItem("tempMinDia");
      localStorage.removeItem("tempMaxDia");
    }

    // Temperatura actual
    const tempC = fToC(o.temperature?.value);
    const feels = fToC(o.feels_like?.value);

    const tempBigEl = document.getElementById("tempBig");
    tempBigEl.textContent = tempC !== "--" ? tempC.toFixed(1)+"°" : "--";
    tempBigEl.className = "tempBig " + claseTemperatura(tempC);

    // Actualizar min y max y guardarlas en localStorage
    if(tempC !== "--"){
      if(tempMinDia === null || tempC < tempMinDia){
        tempMinDia = tempC;
        localStorage.setItem("tempMinDia", tempMinDia);
      }
      if(tempMaxDia === null || tempC > tempMaxDia){
        tempMaxDia = tempC;
        localStorage.setItem("tempMaxDia", tempMaxDia);
      }
    }

    // Actualizar min y max en el DOM con colores
    const tempMinEl = document.getElementById("tempMin");
    const tempMaxEl = document.getElementById("tempMax");

    tempMinEl.textContent = "Mínima diaria: "+(tempMinDia !== null ? tempMinDia.toFixed(1)+"°" : "--");
    tempMaxEl.textContent = "Máxima diaria: "+(tempMaxDia !== null ? tempMaxDia.toFixed(1)+"°" : "--");

    tempMinEl.className = "tempMin " + claseTemperatura(tempMinDia);
    tempMaxEl.className = "tempMax " + claseTemperatura(tempMaxDia);

    // Humedad
    document.getElementById("hum").textContent = o.humidity?.value ?? "--";

    // Viento
    const windKm = mphToKmh(w.wind_speed?.value);
    document.getElementById("windValue").textContent = windKm !== "--" ? windKm.toFixed(1)+" km/h" : "--";
    document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(w.wind_direction?.value);

    // Racha máxima
    const gustKm = mphToKmh(w.wind_gust?.value);
    document.getElementById("windMax").textContent = "Racha máxima diaria: "+(gustKm !== "--" ? gustKm.toFixed(1)+" km/h" : "--");

    // Lluvia
    const rainMm = inToMm(rain.daily?.value);
    const rainMonthMm = inToMm(rain.monthly?.value);
    document.getElementById("rain").textContent = rainMm !== "--" ? rainMm.toFixed(1) : "--";
    document.getElementById("rainMonth").textContent = rainMonthMm !== "--" ? rainMonthMm.toFixed(1) : "--";

    // Presión
    const pres = inHgToHpa(p.relative?.value);
    document.getElementById("press").textContent = pres !== "--" ? pres.toFixed(1) : "--";

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

// Inicialización
obtenerDatos();
setInterval(obtenerDatos, 120000); // cada 2 minutos
