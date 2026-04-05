// Переключение экранов
function switchView(viewId, el) {
    // Скрываем все экраны
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    // Показываем нужный
    document.getElementById('view-' + viewId).classList.remove('hidden');
    
    // Активная кнопка в меню
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    
    tg.HapticFeedback.impactOccurred('light');
}

// Система проверки билетов
const TicketSystem = {
    storageKey: 'user_ticket_data',

    saveTicket(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.render();
    },

    getTicket() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return null;
        
        const ticket = JSON.parse(raw);
        // ПРОВЕРКА: Удаление если дата прошла
        const eventDate = new Date(ticket.eventDateRaw); 
        if (eventDate < new Date().setHours(0,0,0,0)) {
            this.deleteTicket();
            return null;
        }
        return ticket;
    },

    deleteTicket() {
        localStorage.removeItem(this.storageKey);
        this.render();
    },

    render() {
        const container = document.getElementById('tickets-container');
        const ticket = this.getTicket();
        const form = document.getElementById('pass-form');

        if (ticket) {
            form.innerHTML = `<div class="info-box">У вас уже есть активный билет на этот ивент.</div>`;
            container.innerHTML = `
                <div class="active-ticket">
                    <span class="ticket-status">CONFIRMED</span>
                    <h3>${ticket.eventTitle}</h3>
                    <p>${ticket.eventDate}</p>
                    <div style="margin-top:15px; font-family: monospace;">ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
                <button class="btn-secondary" style="margin-top:20px" onclick="TicketSystem.deleteTicket()">ОТМЕНИТЬ БИЛЕТ</button>
            `;
        }
    }
};

// При загрузке
window.onload = () => {
    TicketSystem.render();
    
    // Заполняем профиль из TG
    if(tg.initDataUnsafe.user) {
        document.getElementById('user-full-name').innerText = tg.initDataUnsafe.user.first_name;
        document.getElementById('user-handle').innerText = '@' + tg.initDataUnsafe.user.username;
    }
};

// В функции отправки формы (в блоке успеха n8n):
// if (response.ok) {
//    TicketSystem.saveTicket({
//        eventTitle: document.getElementById('display-title').innerText,
//        eventDate: document.getElementById('display-date').innerText,
//        eventDateRaw: "2026-04-12" // Эту дату админ должен передавать в формате YYYY-MM-DD
//    });
// }