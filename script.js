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
    const pressHpa=inHgToHpa(p.relative.value);
    const uv=data.data.solar_and_uvi.uvi.value;
    const solar=data.data.solar_and_uvi.solar.value;

    // -----------------------------
    // LLUVIA CON BARRAS
    // -----------------------------
    const rainMm = inToMm(rain.daily.value);
    const rainMonthMm = inToMm(rain.monthly.value);
    const rainYearMm = inToMm(rain.yearly.value);

    document.getElementById("rainValue").textContent = rainMm.toFixed(1)+" mm";
    document.getElementById("rainMonthValue").textContent = rainMonthMm.toFixed(1)+" mm";
    document.getElementById("rainYearValue").textContent = rainYearMm.toFixed(1)+" mm";

    const maxDay = 50;
    const maxMonth = 300;
    const maxYear = 1200;

    document.getElementById("rain").style.width = Math.min(100,(rainMm/maxDay)*100)+"%";
    document.getElementById("rainMonth").style.width = Math.min(100,(rainMonthMm/maxMonth)*100)+"%";
    document.getElementById("rainYear").style.width = Math.min(100,(rainYearMm/maxYear)*100)+"%";

    // mín/max diario y viento
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

  }catch(error){
    console.log("error",error);
  }
}

obtenerDatos();
setInterval(obtenerDatos,120000);

****************************************************************************************************************************

/* =============================
BODY Y FONDO
============================= */
body{
margin:0;
font-family:Arial, Helvetica, sans-serif;
background:linear-gradient(to bottom,#1e3c72,#2a5298);
color:white;
text-align:center;
transition:background 2s ease;
}

/* HEADER */
header{
padding:20px;
background:#001f3f;
box-shadow:0 3px 10px rgba(0,0,0,0.4);
}
header h1{
margin:0;
font-size:34px;
letter-spacing:1px;
}
.subtitle{
font-size:16px;
opacity:0.8;
margin-top:5px;
}

/* CONTENEDOR */
.container{
max-width:1400px;
margin:auto;
padding:20px;
display:grid;
grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
gap:20px;
align-items:start;
}

/* TARJETAS */
.card{
background: rgba(255,255,255,0.08);
backdrop-filter: blur(14px);
padding:22px;
border-radius:22px;
box-shadow:
0 5px 12px rgba(0,0,0,0.25),
inset 0 0 10px rgba(255,255,255,0.05);
transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}
.card:hover{
transform:translateY(-6px);
box-shadow:
0 12px 24px rgba(0,0,0,0.4),
inset 0 0 10px rgba(255,255,255,0.15);
background:rgba(255,255,255,0.14);
}

/* NUMEROS GRANDES */
.bigTemp,.bigNumber,.rainBig{
font-weight:bold;
transition: color 0.6s ease, text-shadow 0.6s ease;
text-shadow: 0 0 12px rgba(255,255,255,0.9),0 0 25px rgba(255,255,255,0.6);
}
.bigTemp{font-size:80px;letter-spacing:2px;}
.bigNumber{font-size:42px;}
.rainBig{font-size:70px;}

/* RACHA MAXIMA */
#windMaxBig{
font-size:55px;color:#ffd000;
text-shadow:0 0 12px rgba(255,210,0,0.9),0 0 30px rgba(255,210,0,0.7);
}

/* ROSA DE LOS VIENTOS */
.rosa{
position:relative;width:190px;height:190px;border:4px solid white;border-radius:50%;
margin:auto;background:white;
box-shadow: inset 0 0 15px rgba(0,0,0,0.4),0 0 15px rgba(0,0,0,0.2);
}
.flecha{
position:absolute;width:6px;height:85px;
background:linear-gradient(to top,#003366,#66ccff);
top:50%;left:50%;
transform-origin:50% 100%;
transform:translate(-50%,-100%) rotate(0deg);
border-radius:3px;
box-shadow:0 0 8px rgba(0,0,0,0.4);
transition:transform 1s ease;
}
.flecha::after{
content:"";position:absolute;bottom:-7px;left:50%;width:14px;height:14px;
background:#003366;border-radius:50%;transform:translateX(-50%);
}
.cardinal{position:absolute;color:#003366;font-weight:bold;font-size:14px;}
.norte{top:4%;left:50%;transform:translate(-50%,-50%)}
.sur{bottom:4%;left:50%;transform:translate(-50%,50%)}
.este{right:4%;top:50%;transform:translate(50%,-50%)}
.oeste{left:4%;top:50%;transform:translate(-50%,-50%)}
.noreste{top:15%;right:15%}
.sureste{bottom:15%;right:15%}
.suroeste{bottom:15%;left:15%}
.noroeste{top:15%;left:15%}

/* TARJETAS GRANDES */
.grafCard{grid-column: span 2;}
.radarCard{grid-column: span 2;}

/* RADAR */
.radarBox iframe{width:100%;height:750px;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.4);}
/* =============================
   TARJETAS GRÁFICAS
============================= */
.grafCard{
  grid-column: span 2;
}

.radarCard{
  grid-column: span 2;
}

/* =============================
   BARRAS DE LLUVIA
============================= */
.rainBars{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:10px;
}

.rainBars div{
  display:flex;
  align-items:center;
  gap:10px;
}

.rainBars span{
  width:40px;
  text-align:right;
}

.bar{
  flex:1;
  height:20px;
  border-radius:10px;
  background: rgba(0, 0, 255, 0.2);
  transition: width 0.8s ease, background 0.8s ease;
}

.rainDay .bar{background:#66ccff;}
.rainMonth .bar{background:#3399ff;}
.rainYear .bar{background:#003366;}

.value{
  width:50px;
  text-align:left;
  font-weight:bold;
}

/* RESPONSIVE MOVIL */
@media (max-width:700px){
.bigTemp{font-size:60px;}
.bigNumber{font-size:32px;}
.rainBig{font-size:55px;}
.rosa{width:150px;height:150px;}
.radarBox iframe{height:450px;}
