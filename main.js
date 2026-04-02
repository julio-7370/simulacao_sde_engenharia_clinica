let X, prob, predictiveInterval, stepCount = 0;
let dt, mu, sigma, Xlim, alpha;
let simulationInterval;

let som = new Audio('superMarioTheme.mp3');

// Mostrar valores dos sliders
const sliders = ["X0","mu","sigma","Xlim","dt","predictiveInterval", "alpha"];
sliders.forEach(id => {
  const el = document.getElementById(id);
  const label = document.getElementById(id+"Val") || document.getElementById("predVal");
  const update = () => label.textContent = el.value;
  el.addEventListener("input", update);
  update();
});

// Gráfico com gradiente
const ctx = document.getElementById('simulationChart').getContext('2d');
const gradient = ctx.createLinearGradient(0,0,0,400);
gradient.addColorStop(0, "rgba(66,165,245,0.4)");
gradient.addColorStop(1, "rgba(66,165,245,0.05)");

const simulationChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'X(t) - Estado do Equipamento',
      data: [],
      borderColor: '#1e88e5',
      backgroundColor: gradient,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    animation: { duration: 300 },
    scales: {
      x: {
        title: { display: true, text: 'Tempo (t)'}
      },
      y: {
        title: { display: true, text: 'Estado X(t)'},
        min: 0, max: 120 
      }
    }
  }
});

// Grafico de probabilidade
const probCtx = document.getElementById('probabilityChart').getContext('2d');
const probabilityChart = new Chart(probCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Probabilidade de Falha',
      data: [],
      borderColor: '#8308f5',
      backgroundColor: gradient,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    animation: { duration: 300 },
    scales: {
      x: {
        title: { display: true, text: 'Tempo (t)'}
      },
      y: {
        title: { display: true, text: 'Probabilidade de Falha'},
        min: 0 , max: 1
      }
    }
  }
});


function correctiveMaintenance() { X = alpha * 100; }
function predictiveMaintenance() { X = Math.min(X + 15, 100); }

function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function failureProbability(estado){
  let gamma = 1 - 2 * mu / (sigma ** 2);
  return (Xlim / estado) ** gamma;
}

function updateStatus() {
  const status = document.getElementById("statusIndicator");
  if (X <= Xlim + 10) {
    status.textContent = "Estado: Falha";
    status.className = "status failure";
  } else if (X < Xlim + 20) {
    status.textContent = "Estado: Risco";
    status.className = "status warning";
  } else {
    status.textContent = "Estado: Saudável";
    status.className = "status healthy";
  }
}

function simulateStep() {
  stepCount++;
  const dW = Math.sqrt(dt) * gaussianRandom();
  X += -mu * X * dt + sigma * X * dW;
  X = Math.min(Math.max(X, 0), 100);
  prob = failureProbability(X);

  if (X <= Xlim) correctiveMaintenance();
  if (stepCount % predictiveInterval === 0) predictiveMaintenance();


  simulationChart.data.labels.push(stepCount * dt);
  simulationChart.data.datasets[0].data.push(X);
  simulationChart.update();

  probabilityChart.data.labels.push(stepCount * dt);
  probabilityChart.data.datasets[0].data.push(prob);
  probabilityChart.update();

  updateStatus();
}

function startSimulation() {
  if (!simulationInterval) {

    som.play();
    X = parseFloat(document.getElementById("X0").value);
    mu = parseFloat(document.getElementById("mu").value);
    sigma = parseFloat(document.getElementById("sigma").value);
    Xlim = parseFloat(document.getElementById("Xlim").value);
    dt = parseFloat(document.getElementById("dt").value);
    predictiveInterval = parseInt(document.getElementById("predictiveInterval").value);
    alpha = parseFloat(document.getElementById("alpha").value);
    simulationInterval = setInterval(simulateStep, 100);
  }
}

function stopSimulation() {
  som.pause();
  clearInterval(simulationInterval);
  simulationInterval = null;
}

function resetSimulation() {
  som.pause();
  som.currentTime = 0;
  
  stopSimulation();
  X = 100;
  stepCount = 0;
  simulationChart.data.labels = [];
  simulationChart.data.datasets[0].data = [];
  simulationChart.update();
  
  probabilityChart.data.labels = [];
  probabilityChart.data.datasets[0].data = [];
  probabilityChart.update();
  
  updateStatus();
  
}
