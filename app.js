const tg = window.Telegram.WebApp;
const N8N_URL = 'https://scarface.app.n8n.cloud/webhook-test/4958d6af-6db7-4428-bffc-cf0b60d9d6c5';

tg.expand();

function switchView(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
}

// Проверка 18+ без вывода текста
document.getElementById('birth-date').addEventListener('change', (e) => {
    const birthDate = new Date(e.target.value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    document.getElementById('submit-btn').disabled = (age < 18);
});

document.getElementById('pass-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = tg.initDataUnsafe?.user || {};
    const payload = {
        username: user.username || `id_${user.id || 'unknown'}`,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('birth-date').value,
        event: document.getElementById('display-title').innerText
    };

    try {
        const res = await fetch(N8N_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            tg.showAlert("Готово! Проходка забронирована.");
            tg.close();
        }
    } catch (e) { tg.showAlert("Ошибка сети"); }
};

// Админка
function toggleAdminPanel() { document.getElementById('admin-panel').classList.toggle('hidden'); }
function updateEventData() {
    const t = document.getElementById('edit-title').value;
    const d = document.getElementById('edit-desc').value;
    const dt = document.getElementById('edit-date').value;
    if(t) document.getElementById('display-title').innerText = t;
    if(d) document.getElementById('display-desc').innerText = d;
    if(dt) document.getElementById('display-date').innerText = "📅 " + dt;
    toggleAdminPanel();
}

// Данные профиля
if(tg.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    document.getElementById('user-full-name').innerText = u.first_name + (u.last_name ? " " + u.last_name : "");
    document.getElementById('user-handle').innerText = u.username ? "@" + u.username : "ID: " + u.id;
}
