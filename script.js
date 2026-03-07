const url = "https://meteo-cosuenda-api.luisromea.workers.dev/";

const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

function gradosADireccion(g){

const d=["N","NE","E","SE","S","SW","W","NW"];

return d[Math.round(g/45)%8];

}

async function obtenerDatos(){

try{

const response=await fetch(url);

const data=await response.json();

const o=data.data.outdoor;

const w=data.data.wind;

const rain=data.data.rainfall;

const p=data.data.pressure;

const tempC=fToC(o.temperature.value);

const hum=o.humidity.value;

const windKm=mphToKmh(w.wind_speed.value);

const windDeg=w.wind_direction.value;

const rainMm=inToMm(rain.daily.value);

const rainMonthMm=inToMm(rain.monthly.value);

const pressHpa=inHgToHpa(p.relative.value);

document.getElementById("tempBig").textContent=tempC.toFixed(1)+"°";

document.getElementById("hum").textContent=hum+"%";

document.getElementById("windValue").textContent=windKm.toFixed(1)+" km/h";

document.getElementById("windDirText").textContent="Dirección "+gradosADireccion(windDeg);

document.getElementById("press").textContent=pressHpa.toFixed(1)+" hPa";

const rainElement=document.getElementById("rain");

rainElement.textContent=rainMm.toFixed(1);

if(rainMm>0){

rainElement.className="rainBig rainWet";

}else{

rainElement.className="rainBig rainDry";

}

document.getElementById("rainMonth").textContent=rainMonthMm.toFixed(1)+" mm";

document.getElementById("flechaViento").style.transform =
`translate(-50%,-100%) rotate(${windDeg}deg)`;

document.getElementById("uv").textContent=data.data.solar_and_uvi.uvi.value;

document.getElementById("solar").textContent=data.data.solar_and_uvi.solar.value+" W/m²";

/* icono simple */

let icon="☀️";

if(rainMm>0) icon="🌧";

if(hum>80) icon="☁️";

document.getElementById("weatherIcon").textContent=icon;

}catch(e){

console.log(e);

}

}

obtenerDatos();

setInterval(obtenerDatos,300000);
