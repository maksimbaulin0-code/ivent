const tg = window.Telegram.WebApp;
const N8N_WEBHOOK_URL = 'https://scarface.app.n8n.cloud/webhook-test/4958d6af-6db7-4428-bffc-cf0b60d9d6c5'; // Подставь свой URL

tg.expand();

// 1. ИСПРАВЛЕННАЯ Функция переключения вкладок
function switchView(viewId, el) {
    // Скрываем все views в #app-content
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    // Показываем нужную
    document.getElementById('view-' + viewId).classList.remove('hidden');
    
    // Обновляем активный класс в навигации
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    // Легкая вибрация при клике
    tg.HapticFeedback.impactOccurred('light');
}

// 2. Логика валидации возраста (18+)
const birthInput = document.getElementById('birth-date');
const submitBtn = document.getElementById('submit-btn');
const ageError = document.getElementById('age-error');

function calculateAge(birthday) {
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

birthInput.addEventListener('change', (e) => {
    if (!e.target.value) return;
    
    const birthDate = new Date(e.target.value);
    if (calculateAge(birthDate) >= 18) {
        // Успех
        submitBtn.disabled = false;
        ageError.style.display = 'none';
        birthInput.style.borderColor = '#333';
    } else {
        // Ошибка
        submitBtn.disabled = true;
        ageError.style.display = 'block';
        birthInput.style.borderColor = 'red';
    }
});

// 3. Отправка вебхука (username + телефон + имя)
document.getElementById('pass-form').onsubmit = async (e) => {
    e.preventDefault();
    
    if (submitBtn.disabled) return;
    submitBtn.innerText = 'ОТПРАВКА...';

    const userData = tg.initDataUnsafe?.user || {};
    
    // Формируем payload. Username будет id_XXX, если юзернейма нет.
    const payload = {
        username: userData.username || `id_${userData.id || 'unknown'}`,
        first_name: userData.first_name || 'Guest',
        last_name: userData.last_name || '',
        phone: document.getElementById('phone').value,
        dob: birthInput.value,
        event: document.getElementById('display-title').innerText
    };

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            tg.showAlert('Заявка принята! Ждем тебя.');
            tg.close();
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        tg.showAlert('Ошибка отправки. Попробуй позже.');
        submitBtn.innerText = 'ПОЛУЧИТЬ ПРОХОДКУ';
    }
};
