const tg = window.Telegram.WebApp;
const N8N_URL = 'ТВОЙ_ВЕБХУК_ТУТ';

tg.expand();

// 1. Навигация
function switchView(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    if(viewId === 'tickets') renderTickets();
}

// 2. Валидация возраста 18+
const birthInput = document.getElementById('birth-date');
const submitBtn = document.getElementById('submit-btn');

birthInput.addEventListener('change', () => {
    const birthDate = new Date(birthInput.value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const isAdult = age >= 18;
    
    document.getElementById('age-error').style.display = isAdult ? 'none' : 'block';
    submitBtn.disabled = !isAdult;
});

// 3. ОТПРАВКА ДАННЫХ (Исправленный Username)
document.getElementById('pass-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // ГАРАНТИРОВАННЫЙ ЗАХВАТ ДАННЫХ
    const user = tg.initDataUnsafe?.user || {};
    const payload = {
        username: user.username || `id_${user.id || 'unknown'}`,
        first_name: user.first_name || 'Guest',
        last_name: user.last_name || '',
        phone: document.getElementById('phone').value,
        dob: birthInput.value,
        event: document.getElementById('display-title').innerText
    };

    try {
        const resp = await fetch(N8N_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            // Сохраняем билет локально
            localStorage.setItem('my_ticket', JSON.stringify({
                title: payload.event,
                date: document.getElementById('display-date').innerText,
                expire: new Date().getTime() + 86400000 // Пример: на 24 часа
            }));
            tg.showAlert("Билет получен!");
            switchView('tickets', document.querySelectorAll('.nav-item')[1]);
        }
    } catch (err) {
        tg.showAlert("Ошибка отправки!");
    }
};

// 4. Рендер билетов
function renderTickets() {
    const container = document.getElementById('tickets-container');
    const ticket = JSON.parse(localStorage.getItem('my_ticket'));

    if (ticket) {
        container.innerHTML = `
            <div class="ticket-card" style="border-color: white">
                <span class="badge">ACTIVE PASS</span>
                <h3>${ticket.title}</h3>
                <p>${ticket.date}</p>
                <button class="btn-secondary" onclick="deleteTicket()">УДАЛИТЬ</button>
            </div>`;
    } else {
        container.innerHTML = `<div class="empty-state">У вас пока нет билетов</div>`;
    }
}

function deleteTicket() {
    localStorage.removeItem('my_ticket');
    renderTickets();
}

// 5. Админка
function toggleAdminPanel() { document.getElementById('admin-panel').classList.toggle('hidden'); }
function updateEventData() {
    const t = document.getElementById('edit-title').value;
    if(t) document.getElementById('display-title').innerText = t;
    toggleAdminPanel();
    tg.HapticFeedback.notificationOccurred('success');
}

// Загрузка данных профиля
if(tg.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    document.getElementById('user-full-name').innerText = u.first_name;
    document.getElementById('user-handle').innerText = u.username ? '@'+u.username : 'no username';
}