export async function calculateEarnings(name) {
  const response = await fetch(`data/${name}.json`);
  const data = await response.json();

//   const now = new Date();
  const hourlyRate = data.hourly_rate;
  const workHours = data.working_hours;

  const first = new Date(data.first_workday);
  const last = new Date(data.last_workday);
  const holidays = (data.holidays || []).map(d => new Date(d).toDateString());

  const vacationDays = new Set();
  (data.vacation_days || []).forEach(([start, end]) => {
    const s = new Date(start);
    const e = new Date(end);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      vacationDays.add(d.toDateString());
    }
  });
const now = new Date();
const endOfToday = new Date(now);
endOfToday.setHours(23, 59, 59, 999);

let totalEarned = 0;
let current = new Date(first);

while (current <= endOfToday && current <= new Date(last)) {
  const weekday = current.getDay(); // 0 = søndag, 6 = lørdag
  const dateStr = current.toDateString();

  const isWorkday = weekday >= 1 && weekday <= 5 &&
                    !holidays.includes(dateStr) &&
                    !vacationDays.has(dateStr);

  if (isWorkday) {
    if (current.toDateString() === now.toDateString()) {
      // Beregn bare for i dag basert på klokkeslett
      const startHour = 8;
      const endHour = 16;
      const currentHour = now.getHours() + now.getMinutes() / 60;

      if (currentHour >= endHour) {
        totalEarned += workHours * hourlyRate;
      } else if (currentHour > startHour) {
        const worked = Math.min(currentHour - startHour, workHours);
        totalEarned += worked * hourlyRate;
      }
      // ellers: før 08:00 → ikke tjent noe i dag
    } else {
      // Tidligere dager: full arbeidsdag
      totalEarned += workHours * hourlyRate;
    }
  }

  current.setDate(current.getDate() + 1);
}

  return Math.floor(totalEarned);
}
