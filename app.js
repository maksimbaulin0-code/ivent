const tg = window.Telegram.WebApp;
// Укажи здесь URL для проверки наличия билета
const CHECK_TICKET_URL = 'https://scarface.app.n8n.cloud/webhook/4958d6af-6db7-4428-bffc-cf0b60d9d6c5'; 
const REGISTER_URL = 'https://scarface.app.n8n.cloud/webhook/1f3233b3-ddc9-41d2-accc-e473577743fa';

tg.expand();

// Данные пользователя
const user = tg.initDataUnsafe?.user || {};
const username = user.username || `id_${user.id || 'unknown'}`;

// 1. ПРОВЕРКА ПРИ ЗАПУСКЕ
async function checkUserTicket() {
    try {
        const response = await fetch(`${CHECK_TICKET_URL}?username=${username}`);
        const data = await response.json();

        if (data.hasTicket) {
            showAlreadyHasTicket();
        }
    } catch (error) {
        console.error("Ошибка проверки билета:", error);
    }
}

function showAlreadyHasTicket() {
    const form = document.getElementById('pass-form');
    // Скрываем форму и показываем сообщение
    form.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; text-align: center; border: 1px dashed #444;">
            <p style="color: #fff; font-weight: bold; margin-bottom: 10px;">🎟 У вас уже есть активный билет!</p>
            <p style="color: var(--text-dim); font-size: 13px;">Вы можете найти его во вкладке "Билеты".</p>
        </div>
    `;
}

// Запускаем проверку сразу
checkUserTicket();

// Остальная логика (навигация)
function switchView(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
}

// Валидация возраста
document.getElementById('birth-date').addEventListener('change', (e) => {
    const birthDate = new Date(e.target.value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    document.getElementById('submit-btn').disabled = (age < 18);
});

// Регистрация
document.getElementById('pass-form').onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    if(submitBtn.disabled) return;

    submitBtn.innerText = "ОТПРАВКА...";
    
    const payload = {
        username: username,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('birth-date').value,
        event: document.getElementById('display-title').innerText
    };

    try {
        const res = await fetch(REGISTER_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            tg.showAlert("Билет успешно забронирован!");
            showAlreadyHasTicket(); // Сразу меняем вид формы
        }
    } catch (e) {
        tg.showAlert("Ошибка при регистрации");
        submitBtn.innerText = "ПОЛУЧИТЬ ПРОХОДКУ";
    }
};

// Заполнение профиля
if(user.id) {
    document.getElementById('user-full-name').innerText = user.first_name;
    document.getElementById('user-handle').innerText = "@" + (user.username || user.id);
}
