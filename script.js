const url="https://meteo-cosuenda-api.luisromea.workers.dev/";

// ===== Conversión de unidades =====

function fToC(f){
return (f-32)*5/9;
}

function mphToKmh(mph){
return mph*1.60934;
}

function inToMm(i){
return i*25.4;
}

function inHgToHpa(i){
return i*33.8639;
}

// ===== Dirección del viento =====

function gradosADireccion(grados){

const dirs=["N","NE","E","SE","S","SW","W","NW"];

return dirs[Math.round(grados/45)%8];

}

// ===== Colores dinámicos =====

function colorTemp(t){

if(t<0) return "#00BFFF";
if(t<10) return "#4FC3F7";
if(t<20) return "#66BB6A";
if(t<30) return "#FFA726";
return "#EF5350";

}

function colorHum(h){

if(h<30) return "#FFB74D";
if(h<60) return "#66BB6A";
return "#42A5F5";

}

function colorViento(v){

if(v<10) return "#66BB6A";
if(v<30) return "#FFA726";
return "#EF5350";

}

function colorLluvia(r){

if(r==0) return "#AAAAAA";
if(r<10) return "#42A5F5";
return "#1565C0";

}

function colorUV(u){

if(u<3) return "#66BB6A";
if(u<6) return "#FFA726";
if(u<8) return "#EF5350";
return "#8E24AA";

}

// ===== Reset diarios =====

function comprobarReset(){

const hoy = new Date().getDate();
const guardado = localStorage.getItem("diaGuardado");

if(guardado != hoy){

localStorage.setItem("tempMin", 999);
localStorage.setItem("tempMax", -999);
localStorage.setItem("windMax", 0);

localStorage.setItem("diaGuardado", hoy);

}

}

// ===== Obtener datos =====

async function obtenerDatos(){

try{

comprobarReset();

const response = await fetch(url);
const data = await response.json();

if(data.code!==0) return;

const o = data.data.outdoor;
const w = data.data.wind;
const rain = data.data.rainfall;
const p = data.data.pressure;

// Temperaturas

const tempC = fToC(o.temperature.value);
const feels = o.feels_like ? fToC(o.feels_like.value) : tempC;
const hum = parseFloat(o.humidity.value);

// Viento

const windKm = mphToKmh(w.wind_speed.value);
const windDeg = parseFloat(w.wind_direction.value);
const windGust = mphToKmh(w.wind_gust.value ?? 0);

// Lluvia

const rainMm = inToMm(rain.daily.value);
const rainMonthMm = inToMm(rain.monthly?.value ?? 0);

// Presión

const pressHpa = inHgToHpa(p.relative.value);

// UV y radiación

const uvIndex = data.data.solar_and_uvi?.uvi?.value ?? 0;
const solar = data.data.solar_and_uvi?.solar?.value ?? "--";

// ===== Máximos y mínimos =====

let tempMin = parseFloat(localStorage.getItem("tempMin"));
let tempMax = parseFloat(localStorage.getItem("tempMax"));
let windMax = parseFloat(localStorage.getItem("windMax"));

if(tempC < tempMin){
tempMin = tempC;
localStorage.setItem("tempMin", tempMin);
}

if(tempC > tempMax){
tempMax = tempC;
localStorage.setItem("tempMax", tempMax);
}

if(windGust > windMax){
windMax = windGust;
localStorage.setItem("windMax", windMax);
}

// ===== Actualizar HTML =====

const tempEl = document.getElementById("tempBig");
tempEl.textContent = tempC.toFixed(1)+"°";
tempEl.style.color = colorTemp(tempC);

document.getElementById("sensacion").textContent =
"Sensación térmica: "+feels.toFixed(1)+"°";

document.getElementById("tempMin").textContent =
"Mínima diaria: "+tempMin.toFixed(1)+"°";

document.getElementById("tempMax").textContent =
"Máxima diaria: "+tempMax.toFixed(1)+"°";

const humEl = document.getElementById("hum");
humEl.textContent = hum+"%";
humEl.style.color = colorHum(hum);

const windEl = document.getElementById("windValue");
windEl.textContent = windKm.toFixed(1);
windEl.style.color = colorViento(windKm);

document.getElementById("windDirText").textContent =
"Dirección: "+gradosADireccion(windDeg);

document.getElementById("windMax").textContent =
"Racha máxima diaria: "+windMax.toFixed(1);

const rainEl = document.getElementById("rain");
rainEl.textContent = rainMm.toFixed(1)+" mm";
rainEl.style.color = colorLluvia(rainMm);

document.getElementById("rainMonth").textContent =
rainMonthMm.toFixed(1)+" mm";

document.getElementById("press").textContent =
pressHpa.toFixed(1)+" hPa";

const uvEl = document.getElementById("uv");
uvEl.textContent = uvIndex;
uvEl.style.color = colorUV(uvIndex);

document.getElementById("solar").textContent =
solar+" W/m²";

// ===== Flecha viento =====

document.getElementById("flechaViento").style.transform =
"translate(-50%,-100%) rotate("+windDeg+"deg)";

// ===== Hora actualización =====

const ahora = new Date();

document.getElementById("ultimaActualizacion").textContent =
"Última actualización: "
+ahora.getHours()+":"
+String(ahora.getMinutes()).padStart(2,"0");

}catch(error){

console.log("Error conexión",error);

}

}

// ===== Ejecutar =====

obtenerDatos();

setInterval(obtenerDatos,300000);
