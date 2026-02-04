let plan = JSON.parse(localStorage.getItem("plan")) || [];
let i = 0, t = plan[0]?.duration * 60 || 0;

function render() {
  document.getElementById("name").innerText = plan[i].name;
  document.getElementById("desc").innerText = plan[i].description;
}
render();

setInterval(()=>{
  t--;
  document.getElementById("timer").innerText =
    Math.floor(t/60)+":"+String(t%60).padStart(2,"0");
},1000);

function next(){
  i++;
  if(plan[i]){ t=plan[i].duration*60; render(); }
}
