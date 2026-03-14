// =======================
// script.js - Meteo Cosuenda
// =======================

const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

// Conversión de unidades
const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

// Dirección del viento
function gradosADireccion(g){
  const d=["N","NE","E","SE","S","SW","W","NW"];
  return d[Math.round(g/45)%8];
}

// Historial de temperatura para gráfica
let historialTemp = JSON.parse(localStorage.getItem("histTemp") || "[]");

function actualizarGrafica(temp){
  const ahora = new Date();
  const horaLabel = String(ahora.getHours()).padStart(2,"0")+":"+String(ahora.getMinutes()).padStart(2,"0");
  historialTemp.push({temp,tempHora:horaLabel});
  if(historialTemp.length>24) historialTemp.shift();
  localStorage.setItem("histTemp", JSON.stringify(historialTemp));

  const ctx = document.getElementById("grafTemp");
  if(!ctx) return;

  if(window.graficaTemp) window.graficaTemp.destroy();

  window.graficaTemp = new Chart(ctx, {
    type:"line",
    data:{
      labels: historialTemp.map(d=>d.tempHora),
      datasets:[{
        label:"Temperatura",
        data: historialTemp.map(d=>d.temp),
        borderColor:"#ffcc00",
        backgroundColor:"rgba(255,204,0,0.2)",
        tension:0.4
      }]
    },
    options:{ responsive:true, plugins:{legend:{display:false}} }
  });
}

// Colores según temperatura
function colorTemperatura(temp){
  const el = document.getElementById("tempBig");
  if(!el) return;
  if(temp<0) el.style.color="#00ffff";
  else if(temp<10) el.style.color="#66ccff";
  else if(temp<20) el.style.color="#00ff99";
  else if(temp<30) el.style.color="#ffff66";
  else el.style.color="#ff6666";
}

// Colores según humedad
function colorHumedad(h){
  const el = document.getElementById("hum");
  if(!el) return;
  if(h<40) el.style.color="#ffcc66";
  else if(h<70) el.style.color="#66ffcc";
  else el.style.color="#66ccff";
}

// Modo noche según hora
function modoNoche(){
  const hora = new Date().getHours();
  if(hora>=20 || hora<7){
    document.body.style.background="linear-gradient(#000428,#004e92)";
  } else {
    document.body.style.background="linear-gradient(to bottom,#1e3c72,#2a5298)";
  }
}

// Alertas meteorológicas
let ultimaAlerta = "";
function comprobarAlertas(temp, viento, lluvia){
  const alerta = document.getElementById("alertaMeteo");
  alerta.className = "alerta";
  alerta.textContent = "";
  let mensaje = "";

  if(temp<=0){ alerta.textContent="❄ Aviso de helada"; alerta.classList.add("alertaHelada"); mensaje="Helada"; }
  else if(temp>=35){ alerta.textContent="🔥 Aviso de calor fuerte"; alerta.classList.add("alertaCalor"); mensaje="Calor"; }
  else if(viento>=50){ alerta.textContent="🌬 Aviso de viento fuerte"; alerta.classList.add("alertaViento"); mensaje="Viento"; }
  else if(lluvia>=30){ alerta.textContent="🌧 Lluvia intensa hoy"; alerta.classList.add("alertaLluvia"); mensaje="Lluvia"; }

  ultimaAlerta = mensaje || "";
}

// Función principal: obtener datos del Worker
async function obtenerDatos(){
  try {
    const resp = await fetch(url);
    const json = await resp.json();
    if(!json || json.code!==0) return;

    const o = json.data.outdoor;
    const w = json.data.wind;
    const rain = json.data.rainfall;
    const p = json.data.pressure;
    const uv = json.data.solar_and_uvi.uvi.value;
    const solar = json.data.solar_and_uvi.solar.value;

    // Conversión de unidades
    const tempC = fToC(o.temperature.value);
    const feels = fToC(o.feels_like.value);
    const hum = parseFloat(o.humidity.value);
    const windKm = mphToKmh(w.wind_speed.value);
    const windDeg = parseFloat(w.wind_direction.value);
    const windGust = mphToKmh(w.wind_gust.value);
    const pressHpa = inHgToHpa(p.relative.value);

    const rainMm = inToMm(rain.daily.value);
    const rainMonthMm = inToMm(rain.monthly.value);
    const rainYearMm = inToMm(rain.yearly.value);

    // Actualizar elementos en HTML
    document.getElementById("tempBig").textContent = tempC.toFixed(1)+"°";
    document.getElementById("sensacion").textContent = "Sensación térmica: "+feels.toFixed(1)+"°";
    document.getElementById("tempMin").textContent = "Mínima diaria: "+(o.temperature.low?fToC(o.temperature.low.value).toFixed(1):tempC.toFixed(1))+"°";
    document.getElementById("tempMax").textContent = "Máxima diaria: "+(o.temperature.high?fToC(o.temperature.high.value).toFixed(1):tempC.toFixed(1))+"°";

    document.getElementById("hum").textContent = hum+"%";
    document.getElementById("windValue").textContent = windKm.toFixed(1)+" km/h";
    document.getElementById("windDirText").textContent = "Dirección "+gradosADireccion(windDeg);
    document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
    document.getElementById("uv").textContent = uv;
    document.getElementById("solar").textContent = solar+" W/m²";

    document.getElementById("windMaxBig").textContent = (w.wind_gust.max?mphToKmh(w.wind_gust.max.value).toFixed(1):windGust.toFixed(1))+" km/h";

    // Barras de lluvia
    const maxDay = 50, maxMonth = 300, maxYear = 1200;
    document.getElementById("rainValue").textContent = rainMm.toFixed(1)+" mm";
    document.getElementById("rainMonthValue").textContent = rainMonthMm.toFixed(1)+" mm";
    document.getElementById("rainYearValue").textContent = rainYearMm.toFixed(1)+" mm";

    document.getElementById("rain").style.width = Math.min(100,(rainMm/maxDay)*100)+"%";
    document.getElementById("rainMonth").style.width = Math.min(100,(rainMonthMm/maxMonth)*100)+"%";
    document.getElementById("rainYear").style.width = Math.min(100,(rainYearMm/maxYear)*100)+"%";

    // Rosa de los vientos
    document.getElementById("flechaViento").style.transform = `translate(-50%,-100%) rotate(${windDeg}deg)`;

    // Colores y efectos
    colorTemperatura(tempC);
    colorHumedad(hum);
    if(windKm>40) document.getElementById("windValue").style.textShadow="0 0 20px #ffffff";

    // Gráfica, modo noche y alertas
    actualizarGrafica(tempC);
    modoNoche();
    comprobarAlertas(tempC, mphToKmh(w.wind_gust.value), rainMm);

    // Última actualización
    const ahora = new Date();
    document.getElementById("ultimaActualizacion").textContent = "Última actualización "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");
    
  } catch(e) {
    console.error("Error obteniendo datos del Worker:", e);
  }
}

// Inicializar
obtenerDatos();
setInterval(obtenerDatos, 120000); // cada 2 minutos
