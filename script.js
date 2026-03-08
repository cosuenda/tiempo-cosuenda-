const url = "https://meteo-cosuenda-api.luisromea.workers.dev/";

const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

function gradosADireccion(g){
const d=["N","NE","E","SE","S","SW","W","NW"];
return d[Math.round(g/45)%8];
}

function hoyString(){
const h=new Date();
return h.getFullYear()+"-"+(h.getMonth()+1)+"-"+h.getDate();
}

function comprobarCambioDia(){
const hoy=hoyString();
const guardado=localStorage.getItem("diaActual");
if(guardado!==hoy){
localStorage.setItem("diaActual",hoy);
localStorage.setItem("tempMin","999");
localStorage.setItem("tempMax","-999");
localStorage.setItem("windMax","0");
}
}
comprobarCambioDia();

let historialTemp=JSON.parse(localStorage.getItem("histTemp")||[]);

function actualizarGrafica(temp){
const ahora=new Date();
const horaLabel = String(ahora.getHours()).padStart(2,"0")+":"+String(ahora.getMinutes()).padStart(2,"0");
historialTemp.push({temp,tempHora:horaLabel});
if(historialTemp.length>24) historialTemp.shift();
localStorage.setItem("histTemp",JSON.stringify(historialTemp));
const ctx=document.getElementById("grafTemp");
if(!ctx) return;
new Chart(ctx,{
type:"line",
data:{
labels:historialTemp.map(d=>d.tempHora),
datasets:[{label:"Temperatura",data:historialTemp.map(d=>d.temp),borderColor:"#ffcc00",backgroundColor:"rgba(255,204,0,0.2)",tension:0.4}]
},
options:{responsive:true,plugins:{legend:{display:false}}}
});
}

function colorTemperatura(temp){
const el=document.getElementById("tempBig");
if(temp<0) el.style.color="#00ffff";
else if(temp<10) el.style.color="#66ccff";
else if(temp<20) el.style.color="#00ff99";
else if(temp<30) el.style.color="#ffff66";
else el.style.color="#ff6666";
}

function colorHumedad(h){
const el=document.getElementById("hum");
if(h<40) el.style.color="#ffcc66";
else if(h<70) el.style.color="#66ffcc";
else el.style.color="#66ccff";
}

function modoNoche(){
const hora=new Date().getHours();
if(hora>=20 || hora<7){
document.body.style.background="linear-gradient(#000428,#004e92)";
}
}

async function obtenerDatos(){
try{
const response=await fetch(url);
const data=await response.json();
if(data.code!==0) return;
const o=data.data.outdoor;
const w=data.data.wind;
const rain=data.data.rainfall;
const p=data.data.pressure;

const tempC=fToC(o.temperature.value);
const feels=fToC(o.feels_like.value);
const hum=parseFloat(o.humidity.value);
const windKm=mphToKmh(w.wind_speed.value);
const windDeg=parseFloat(w.wind_direction.value);
const windGust=mphToKmh(w.wind_gust.value);
// obtener datos
const rainMm = inToMm(rain.daily.value);
const rainMonthMm = inToMm(rain.monthly.value);
const rainYearMm = inToMm(rain.yearly.value); // NUEVO: lluvia anual

// actualizar HTML
const rainElement = document.getElementById("rain");
rainElement.textContent = rainMm.toFixed(1) + " mm";
rainElement.className = "rainBig " + (rainMm > 0 ? "rainWet" : "rainDry");

document.getElementById("rainMonth").textContent = rainMonthMm.toFixed(1) + " mm";
document.getElementById("rainYear").textContent = rainYearMm.toFixed(1) + " mm"; // NUEVO
const pressHpa=inHgToHpa(p.relative.value);
const uv=data.data.solar_and_uvi.uvi.value;
const solar=data.data.solar_and_uvi.solar.value;

let tempMin=parseFloat(localStorage.getItem("tempMin"));
let tempMax=parseFloat(localStorage.getItem("tempMax"));
let windMax=parseFloat(localStorage.getItem("windMax"));
if(tempC<tempMin){tempMin=tempC;localStorage.setItem("tempMin",tempMin);}
if(tempC>tempMax){tempMax=tempC;localStorage.setItem("tempMax",tempMax);}
if(windGust>windMax){windMax=windGust;localStorage.setItem("windMax",windMax);}

document.getElementById("tempBig").textContent=tempC.toFixed(1)+"°";
document.getElementById("sensacion").textContent="Sensación térmica: "+feels.toFixed(1)+"°";
document.getElementById("tempMin").textContent="Mínima diaria: "+tempMin.toFixed(1)+"°";
document.getElementById("tempMax").textContent="Máxima diaria: "+tempMax.toFixed(1)+"°";
document.getElementById("hum").textContent=hum+"%";
document.getElementById("windValue").textContent=windKm.toFixed(1)+" km/h";
document.getElementById("windDirText").textContent="Dirección "+gradosADireccion(windDeg);
document.getElementById("press").textContent=pressHpa.toFixed(1)+" hPa";
document.getElementById("uv").textContent=uv;
document.getElementById("solar").textContent=solar+" W/m²";

const windMaxBig=document.getElementById("windMaxBig");
if(windMaxBig){windMaxBig.textContent=windMax.toFixed(1)+" km/h";}

const rainElement=document.getElementById("rain");
rainElement.textContent=rainMm.toFixed(1)+" mm";
document.getElementById("rainMonth").textContent=rainMonthMm.toFixed(1)+" mm";

document.getElementById("flechaViento").style.transform=`translate(-50%,-100%) rotate(${windDeg}deg)`;

colorTemperatura(tempC);
colorHumedad(hum);

if(windKm>40){
document.getElementById("windValue").style.textShadow="0 0 20px #ffffff";
}

actualizarGrafica(tempC);
modoNoche();

const ahora=new Date();
document.getElementById("ultimaActualizacion").textContent="Última actualización "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

}catch(error){console.log("error",error);}
}

obtenerDatos();
setInterval(obtenerDatos,120000);
