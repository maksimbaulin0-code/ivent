const tg = window.Telegram.WebApp;
tg.expand();

// Элементы управления
const birthInput = document.getElementById('birth-date');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('age-error');

// 1. Проверка возраста (18+)
birthInput.addEventListener('change', (e) => {
    const birthDate = new Date(e.target.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

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

// 2. Логика Админ-панели
function toggleAdmin() {
    document.getElementById('user-view').classList.toggle('hidden');
    document.getElementById('admin-view').classList.toggle('hidden');
}

function updateEvent() {
    const newTitle = document.getElementById('edit-title').value;
    const newDesc = document.getElementById('edit-desc').value;
    const newDate = document.getElementById('edit-date').value;

    if(newTitle) document.getElementById('display-title').innerText = newTitle;
    if(newDesc) document.getElementById('display-desc').innerText = newDesc;
    if(newDate) document.getElementById('display-date').innerText = "📅 " + newDate;

    toggleAdmin(); // Возвращаемся к просмотру
}

// 3. Отправка данных в бота
document.getElementById('pass-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
        phone: document.getElementById('phone').value,
        dob: birthInput.value,
        event: document.getElementById('display-title').innerText
    };
    tg.sendData(JSON.stringify(data));
};
