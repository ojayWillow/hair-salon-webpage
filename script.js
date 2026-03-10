// ===========================
// MOBILE NAV TOGGLE
// ===========================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

// NAVBAR SCROLL SHADOW
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 30 ? '0 4px 24px rgba(26,23,20,0.10)' : 'none';
});

// ===========================
// SCROLL REVEAL
// ===========================
const reveals = document.querySelectorAll('.service-card, .testimonial-card, .gallery-item, .intro-image, .booking-wizard');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = e.target.style.transform.replace('translateY(30px)','translateY(0)');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = (el.style.transform||'') + ' translateY(30px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  revealObs.observe(el);
});

// ===========================
// BOOKING WIZARD
// ===========================

// --- State ---
let selectedService = null;
let selectedDate    = null;
let selectedSlot    = null;

// Simulated booked slots per weekday (0=Mon ... 6=Sun)
// Format: 'YYYY-MM-DD': ['09:00','11:00', ...]
const bookedSlots = {};
function seedBookedSlots() {
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue; // skip Sunday
    const key = fmtDate(d);
    const pool = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
    const count = Math.floor(Math.random() * 4) + 1;
    bookedSlots[key] = pool.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
seedBookedSlots();

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}
function fmtDateLv(dateStr) {
  const months = ['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'];
  const [y,m,day] = dateStr.split('-');
  return `${parseInt(day)}. ${months[parseInt(m)-1]} ${y}`;
}
function fmtMonthLv(year, month) {
  const months = ['Janvāris','Februāris','Marts','Aprīlis','Maijs','Jūnijs','Jūlijs','Augusts','Septembris','Oktobris','Novembris','Decembris'];
  return `${months[month]} ${year}`;
}

// All possible slots
const ALL_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

// --- Wizard navigation ---
function showPanel(id) {
  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  // Update step indicators
  const stepMap = { step1:1, step2:2, step3:3, step4:4, stepSuccess:4 };
  const current = stepMap[id] || 1;
  document.querySelectorAll('.step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.toggle('active', n === current);
    s.classList.toggle('done', n < current);
  });
}

// --- STEP 1: Service selection ---
document.querySelectorAll('input[name="svc"]').forEach(radio => {
  radio.addEventListener('change', () => {
    selectedService = radio.value;
    document.getElementById('toStep2').disabled = false;
    document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('selected'));
    radio.closest('.service-option').querySelector('.svc-card').classList.add('selected');
  });
});
document.getElementById('toStep2').addEventListener('click', () => {
  renderCalendar();
  showPanel('step2');
});

// --- STEP 2: Calendar ---
let calYear, calMonth;
function initCal() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
}
initCal();

function renderCalendar() {
  const label = document.getElementById('calMonthLabel');
  const grid  = document.getElementById('calGrid');
  label.textContent = fmtMonthLv(calYear, calMonth);
  grid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const adjusted = (firstDay === 0) ? 6 : firstDay - 1;    // make Mon=0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < adjusted; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-day blank';
    grid.appendChild(blank);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('button');
    cell.className = 'cal-day';
    cell.textContent = d;
    const thisDate = new Date(calYear, calMonth, d);
    const dateStr  = fmtDate(thisDate);
    const dow = thisDate.getDay(); // 0=Sun
    const isPast   = thisDate < today;
    const isSunday = dow === 0;

    if (isPast || isSunday) {
      cell.classList.add('disabled');
      cell.disabled = true;
    } else {
      const booked = bookedSlots[dateStr] || [];
      const avail  = ALL_SLOTS.length - booked.length;
      if (avail === 0) {
        cell.classList.add('full');
        cell.disabled = true;
        cell.title = 'Nav brīvu laiku';
      } else {
        cell.classList.add('available');
        if (dateStr === selectedDate) cell.classList.add('selected');
        cell.addEventListener('click', () => {
          selectedDate = dateStr;
          document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          document.getElementById('toStep3').disabled = false;
        });
      }
    }
    grid.appendChild(cell);
  }
}

document.getElementById('calPrev').addEventListener('click', () => {
  calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
document.getElementById('calNext').addEventListener('click', () => {
  calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});
document.getElementById('toStep3').addEventListener('click', () => {
  renderSlots();
  showPanel('step3');
});
document.getElementById('backTo1').addEventListener('click', () => showPanel('step1'));

// --- STEP 3: Time slots ---
function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  const label = document.getElementById('slotsDateLabel');
  label.textContent = fmtDateLv(selectedDate);
  grid.innerHTML = '';
  selectedSlot = null;
  document.getElementById('toStep4').disabled = true;

  const booked = bookedSlots[selectedDate] || [];

  ALL_SLOTS.forEach(time => {
    const btn = document.createElement('button');
    btn.className = 'slot-btn';
    btn.textContent = time;
    if (booked.includes(time)) {
      btn.classList.add('booked');
      btn.disabled = true;
      btn.setAttribute('aria-label', `${time} - aizņemts`);
    } else {
      btn.classList.add('free');
      btn.setAttribute('aria-label', `${time} - brīvs`);
      btn.addEventListener('click', () => {
        selectedSlot = time;
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('toStep4').disabled = false;
      });
    }
    grid.appendChild(btn);
  });
}
document.getElementById('toStep4').addEventListener('click', () => {
  renderSummary();
  showPanel('step4');
});
document.getElementById('backTo2').addEventListener('click', () => showPanel('step2'));

// --- STEP 4: Summary + form ---
function renderSummary() {
  document.getElementById('bookingSummary').innerHTML = `
    <div class="summary-row"><span>Pakalpojums</span><strong>${selectedService}</strong></div>
    <div class="summary-row"><span>Datums</span><strong>${fmtDateLv(selectedDate)}</strong></div>
    <div class="summary-row"><span>Laiks</span><strong>${selectedSlot}</strong></div>
  `;
}
document.getElementById('backTo3').addEventListener('click', () => showPanel('step3'));

document.getElementById('detailsForm').addEventListener('submit', e => {
  e.preventDefault();
  const name  = document.getElementById('bfname').value.trim();
  const email = document.getElementById('bfemail').value.trim();
  const terms = document.getElementById('bfterms').checked;
  if (!name || !email || !terms) {
    alert('Lūdzu aizpildi visus obligātos laukus un piekrīti noteikumiem.');
    return;
  }
  // Mark the slot as booked
  if (!bookedSlots[selectedDate]) bookedSlots[selectedDate] = [];
  bookedSlots[selectedDate].push(selectedSlot);
  document.getElementById('successMsg').textContent =
    `${name}, tava vizīte ${fmtDateLv(selectedDate)} plkst. ${selectedSlot} (${selectedService}) ir apstiprināta!`;
  showPanel('stepSuccess');
});

document.getElementById('resetBooking').addEventListener('click', () => {
  selectedService = selectedDate = selectedSlot = null;
  document.getElementById('detailsForm').reset();
  document.querySelectorAll('input[name="svc"]').forEach(r => r.checked = false);
  document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('toStep2').disabled = true;
  showPanel('step1');
});
