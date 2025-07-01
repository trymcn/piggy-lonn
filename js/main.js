import { calculateEarnings } from './earnings.js';

const select = document.getElementById('personSelect');
const moneyContainer = document.getElementById('moneyContainer');
const earnedDisplay = document.getElementById('earnedDisplay');
const piggy = document.getElementById('piggybank');

let intervalId;
let currentEarned = 0;
const plingSound = new Audio("sounds/pling.mp3"); // legg fil i sounds/

select.addEventListener('change', () => {
  startSimulation(select.value);
});

startSimulation(select.value);

function updateDisplay(total) {
  earnedDisplay.textContent = `${total} kr`;
  updatePiggySize(total);
}

function addPiggyShake() {
  piggy.classList.add('shake');
  setTimeout(() => piggy.classList.remove('shake'), 300);
}

function updatePiggySize(totalKr) {
  const baseScale = 1.0;
  const maxScale = 2.0;
  const growthPerThousand = 0.01;
  const scale = Math.min(baseScale + (totalKr / 1000) * growthPerThousand, maxScale);
  piggy.style.transform = `translateX(-50%) scale(${scale})`;
}

async function startSimulation(name) {
  clearInterval(intervalId);
  moneyContainer.innerHTML = '';
  const today = new Date();

  const earnings = await calculateEarnings(name.toLowerCase(), today);
  if (earnings === 0) {
    earnedDisplay.textContent = "0 kr – fri idag!";
    updatePiggySize(0);
    return;
  }

  currentEarned = 0;
  updateDisplay(currentEarned);

  const numBills = Math.floor(earnings / 100);
  const numCoins = earnings % 100;

  let coinsDropped = 0;
  let billsDropped = 0;

  intervalId = setInterval(() => {
    const pigX = window.innerWidth / 2;

    if (billsDropped < numBills) {
      const bill = document.createElement('div');
      bill.className = 'bill';
      bill.style.left = `${pigX + (Math.random() * 60 - 30)}px`;
      moneyContainer.appendChild(bill);
      setTimeout(() => {
        bill.remove();
        currentEarned += 100;
        updateDisplay(currentEarned);
        addPiggyShake();
        plingSound.currentTime = 0;
        plingSound.play();
      }, 4000);
      billsDropped++;
    } else if (coinsDropped < numCoins) {
      const coin = document.createElement('div');
      coin.className = 'coin';
      coin.style.left = `${pigX + (Math.random() * 40 - 20)}px`;
      moneyContainer.appendChild(coin);
      setTimeout(() => {
        coin.remove();
        currentEarned += 1;
        updateDisplay(currentEarned);
        addPiggyShake();
        plingSound.currentTime = 0;
        plingSound.play();
      }, 3000);
      coinsDropped++;
    } else {
      clearInterval(intervalId);
    }
  }, 80);
}
