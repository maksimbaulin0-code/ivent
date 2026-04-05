const tg = window.Telegram.WebApp;

// n8n webhook URLs
const CHECK_TICKET_URL = 'https://scarface.app.n8n.cloud/webhook/4958d6af-6db7-4428-bffc-cf0b60d9d6c5';
const REGISTER_URL = 'https://scarface.app.n8n.cloud/webhook/1f3233b3-ddc9-41d2-accc-e473577743fa';
const APP_OPEN_URL = 'https://scarface.app.n8n.cloud/webhook/3c77fb5f-b5a7-44df-95c3-6f2d519975f8';

tg.expand();

// Telegram user data
const user = tg.initDataUnsafe?.user || {};
const username = user.username || `id_${user.id || 'unknown'}`;

async function sendAppOpenWebhook({ hasTicket = null, status = 'unknown', error = null } = {}) {
    const payload = {
        username,
        userId: user.id || null,
        firstName: user.first_name || null,
        lastName: user.last_name || null,
        openedAt: new Date().toISOString(),
        hasTicket,
        status,
        error,
    };

    try {
        await fetch(APP_OPEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (openError) {
        console.error('Ошибка отправки webhook открытия приложения:', openError);
    }
}

// Check ticket on app open
async function checkUserTicket() {
    try {
        const response = await fetch(`${CHECK_TICKET_URL}?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        const hasTicket = Boolean(data?.hasTicket);

        if (hasTicket) {
            hideRegistrationWindow();
        }

        sendAppOpenWebhook({ hasTicket, status: 'ok' });
    } catch (error) {
        console.error('Ошибка проверки билета:', error);
        sendAppOpenWebhook({ status: 'check_error', error: String(error) });
    }
}

function hideRegistrationWindow() {
    const form = document.getElementById('pass-form');
    if (!form) return;

    form.remove();

    const homeView = document.getElementById('view-home');
    const ticketInfo = document.createElement('div');
    ticketInfo.style.cssText = 'background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; text-align: center; border: 1px dashed #444; margin-top: 16px;';
    ticketInfo.innerHTML = `
        <p style="color: #fff; font-weight: bold; margin-bottom: 10px;">🎟 У вас уже есть активный билет!</p>
        <p style="color: var(--text-dim); font-size: 13px;">Вы можете найти его во вкладке "Билеты".</p>
    `;
    homeView.appendChild(ticketInfo);
}

// Run ticket check on launch
checkUserTicket();

// Navigation
function switchView(viewId, el) {
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
    el.classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
}

// Age validation
const birthDateInput = document.getElementById('birth-date');
const submitBtn = document.getElementById('submit-btn');

if (birthDateInput && submitBtn) {
    birthDateInput.addEventListener('change', (e) => {
        const birthDate = new Date(e.target.value);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        submitBtn.disabled = age < 18;
    });
}

// Registration
const passForm = document.getElementById('pass-form');

if (passForm) {
    passForm.onsubmit = async (e) => {
        e.preventDefault();
        if (submitBtn?.disabled) return;

        if (submitBtn) submitBtn.innerText = 'ОТПРАВКА...';

        const payload = {
            username,
            userId: user.id || null,
            phone: document.getElementById('phone')?.value || '',
            dob: document.getElementById('birth-date')?.value || '',
            event: document.getElementById('display-title')?.innerText || '',
            registeredAt: new Date().toISOString(),
        };

        try {
            const res = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                tg.showAlert('Билет успешно забронирован!');
                hideRegistrationWindow();
            } else {
                tg.showAlert('Не удалось забронировать билет');
                if (submitBtn) submitBtn.innerText = 'ПОЛУЧИТЬ ПРОХОДКУ';
            }
        } catch (registrationError) {
            tg.showAlert('Ошибка при регистрации');
            if (submitBtn) submitBtn.innerText = 'ПОЛУЧИТЬ ПРОХОДКУ';
            console.error('Ошибка регистрации:', registrationError);
        }
    };
}

// Profile data
if (user.id) {
    document.getElementById('user-full-name').innerText = user.first_name;
    document.getElementById('user-handle').innerText = `@${user.username || user.id}`;
}
