const tg = window.Telegram.WebApp;
tg.expand();

// Элементы управления
const birthInput = document.getElementById('birth-date');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('age-error');

// 1. Проверка возраста (18+)
birthInput.addEventListener('change', (e) => {
    const age = calculateAge(e.target.value);
    
    if (age >= 18) {
        submitBtn.disabled = false;
        errorMsg.style.display = 'none';
        birthInput.style.borderColor = '#333';
    } else {
        submitBtn.disabled = true;
        errorMsg.style.display = 'block';
        birthInput.style.borderColor = 'red';
    }
});

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// 2. Переключение админки
function toggleAdmin() {
    document.getElementById('user-view').classList.toggle('hidden');
    document.getElementById('admin-view').classList.toggle('hidden');
}

// 3. Отправка вебхука на n8n
async function sendToN8N(data) {
    const WEBHOOK_URL = 'ТВОЙ_URL_ИЗ_N8N'; // <-- ВСТАВЬ СЮДА ССЫЛКУ ИЗ N8N

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        tg.showAlert("Данные успешно отправлены!");
    } catch (err) {
        console.error("Ошибка n8n:", err);
    }
}

// 4. Главная функция обновления и отправки
function updateEvent() {
    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const birth = birthInput.value;
    
    const title = document.getElementById('edit-title').value;
    const desc = document.getElementById('edit-desc').value;
    const date = document.getElementById('edit-date').value;

    // Сбор данных для n8n
    const payload = {
        user_name: name,
        user_phone: phone,
        user_age: calculateAge(birth),
        event_name: title || "Без названия",
        event_description: desc,
        event_date: date
    };

    // Обновляем текст на экране (на русском)
    if(title) document.getElementById('display-title').innerText = title;
    if(desc) document.getElementById('display-desc').innerText = desc;
    if(date) document.getElementById('display-date').innerText = "📅 " + date;

    // Если заполнены имя и телефон — шлем вебхук
    if(name && phone) {
        sendToN8N(payload);
    } else if (!document.getElementById('admin-view').classList.contains('hidden')) {
        // Если мы в админке, просто закрываем её
        toggleAdmin();
    } else {
        tg.showAlert("Заполните имя и телефон!");
    }
}