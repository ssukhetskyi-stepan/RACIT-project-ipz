// ============================
// Здоровенькі були — script.js
// Повний файл логіки інтерфейсу
// ============================

// ---- Елементи навігації та діалогів ----
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");

const loginDialog = document.getElementById("login-dialog");
const authDialog = document.getElementById("auth-dialog");
const profileDialog = document.getElementById("profile-dialog");
const scheduleDialog = document.getElementById("schedule-dialog");

// ---- Кнопки скасування у діалогах ----
const cancelLoginBtn = document.querySelector(".cancel-login");
const cancelRegisterBtn = document.querySelector(".cancel-register");
const cancelScheduleBtn = document.getElementById("cancel-schedule");

// ---- Форми ----
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const scheduleForm = document.getElementById("schedule-form");

// ---- Поля нагадування ----
const addReminderBtn = document.getElementById("add-reminder-btn");
const reminderType = document.getElementById("reminder-type");
const titleField = document.getElementById("title-field");
const doctorField = document.getElementById("doctor-field");
const doctorSearch = document.getElementById("doctor-search");
const doctorList = document.getElementById("doctor-list");
const medicineField = document.getElementById("medicine-field");
const medicineSearch = document.getElementById("medicine-search");
const medicineList = document.getElementById("medicine-list");
const medicineFrequency = document.getElementById("medicine-frequency");
const scheduleBody = document.getElementById("schedule-body");

// ---- Профіль: фото ----
const fileInput = document.getElementById("profile-photo-upload");
const fileNameSpan = document.getElementById("file-name");
const closeProfileBtn = document.getElementById("close-profile");

// ---- Пошук у таблиці нагадувань ----
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// ---- Демонстраційна авторизація ----
const auth = { currentUser: null };

// ---- Дані для фільтрації списків ----
const DOCTORS = [
  "Кардіолог","Терапевт","Хірург","Офтальмолог","Невролог",
  "Педіатр","Дерматолог","Ендокринолог","Гінеколог","Уролог",
  "Отоларинголог","Психіатр","Ревматолог","Інфекціоніст","Гастроентеролог",
  "Пульмонолог","Нефролог","Стоматолог","Онколог","Алерголог"
];

const MEDICINES = [
  "Ібупрофен","Парацетамол","Аспірин","Амоксицилін","Амоксиклав",
  "Азитроміцин","Доксициклін","Ципрофлоксацин","Кларитроміцин","Цефтріаксон",
  "Метформін","Левотироксин","Аторвастатин","Симвастатин","Росувастатин",
  "Омепразол","Пантопразол","Езомепразол","Ранитидин","Лозартан",
  "Валсартан","Кандесартан","Амлодипін","Ніфедипін","Метопролол",
  "Бісопролол","Атенолол","Карведилол","Фуросемід","Торасемід",
  "Спіронолактон","Гідрохлортіазид","Преднізолон","Дексаметазон","Гідрокортизон",
  "Будесонід","Салбутамол","Формотерол","Іпратропіум","Нітрогліцерин",
  "Ізосорбіду мононітрат","Варфарин","Апіксабан","Клопідогрел","Диклофенак",
  "Напроксен","Кеторолак","Мелоксикам","Німесулід","Цетиризин",
  "Лоратадин","Фексофенадин","Діазолін","Активоване вугілля","Смекта (діосмектит)",
  "Лоперамід","Метоклопрамід","Ондансетрон","Супрастин","Регідрон"
];

// ---- Тости ----
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  t.textContent = message;
  container.appendChild(t);

  requestAnimationFrame(() => t.classList.add("show"));

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, 3000);
}

// ---- Допоміжні ----
function formatTypeLabel(type) {
  return type === "visit" ? "Візит" : type === "medicine" ? "Ліки" : "—";
}

// ============================
// Авторизація
// ============================

// Вхід
loginBtn.addEventListener("click", () => loginDialog.showModal());
cancelLoginBtn.addEventListener("click", () => loginDialog.close());

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Заповніть email і пароль", "error");
    return;
  }

  auth.currentUser = { email, displayName: "Taras User", gender: "" };
  loginDialog.close();

  // Показати кнопку Профіль лише після входу
  profileBtn.hidden = false;
  logoutBtn.hidden = false;

  showToast("Вітаємо! Ви увійшли.", "success");
});

// Реєстрація
registerBtn.addEventListener("click", () => authDialog.showModal());
cancelRegisterBtn.addEventListener("click", () => authDialog.close());

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const firstname = document.getElementById("regFirstname").value.trim();
  const lastname = document.getElementById("regLastname").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const gender = document.getElementById("regGender").value;

  if (!firstname || !lastname || !email || !password || !gender) {
    showToast("Будь ласка, заповніть усі поля", "error");
    return;
  }

  auth.currentUser = { email, displayName: `${firstname} ${lastname}`, gender };
  authDialog.close();

  // Показати кнопку Профіль лише після реєстрації (автоматичний вхід)
  profileBtn.hidden = false;
  logoutBtn.hidden = false;

  showToast("Реєстрація успішна! Ви увійшли.", "success");
});

// Вихід
logoutBtn.addEventListener("click", () => {
  auth.currentUser = null;
  profileBtn.hidden = true;   // сховати профіль після виходу
  logoutBtn.hidden = true;
  showToast("Ви вийшли з акаунта.", "info");
});

// ============================
// Профіль
// ============================

profileBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) {
    showToast("Увійдіть, щоб переглянути профіль", "info");
    return;
  }

  const [firstname = "", lastname = ""] = (user.displayName || "").split(" ");
  document.getElementById("profile-firstname").textContent = firstname;
  document.getElementById("profile-lastname").textContent = lastname;
  document.getElementById("profile-email").textContent = user.email || "";
  document.getElementById("profile-gender").value = user.gender || "";

  profileDialog.showModal();
});

closeProfileBtn.addEventListener("click", () => profileDialog.close());

document.getElementById("profile-gender").addEventListener("change", (e) => {
  if (auth.currentUser) {
    auth.currentUser.gender = e.target.value;
    showToast("Стать оновлено", "success");
  }
});

// Фото профілю
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profile-photo").src = e.target.result;
      showToast("Аватар оновлено", "success");
    };
    reader.readAsDataURL(file);
  } else {
    fileNameSpan.textContent = "Файл не обрано";
  }
});

// ============================
// Нагадування
// ============================

// Відкрити загальний діалог додавання
addReminderBtn.addEventListener("click", () => {
  reminderType.value = "";
  // Початково ховаємо залежні секції
  titleField.hidden = true;
  doctorField.hidden = true;
  medicineField.hidden = true;

  // Очистимо поля пошуку
  doctorSearch.value = "";
  medicineSearch.value = "";

  // Відновимо повні списки
  populateSelect(doctorList, DOCTORS, "— Оберіть лікаря —");
  populateSelect(medicineList, MEDICINES, "— Оберіть ліки —");

  scheduleDialog.showModal();
});

// Перемикач типу нагадування
reminderType.addEventListener("change", (e) => {
  const v = e.target.value;

  // Назва показується лише для ліків
  titleField.hidden = v !== "medicine";

  // Секції для візиту/ліків
  doctorField.hidden = v !== "visit";
  medicineField.hidden = v !== "medicine";
});

// Живий пошук по лікарях
doctorSearch.addEventListener("input", () => {
  const q = doctorSearch.value.trim().toLowerCase();
  const filtered = DOCTORS.filter(d => d.toLowerCase().includes(q));
  populateSelect(doctorList, filtered, "— Оберіть лікаря —");
});

// Живий пошук по ліках
medicineSearch.addEventListener("input", () => {
  const q = medicineSearch.value.trim().toLowerCase();
  const filtered = MEDICINES.filter(m => m.toLowerCase().includes(q));
  populateSelect(medicineList, filtered, "— Оберіть ліки —");
});

// Збереження нагадування
scheduleForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = reminderType.value;
  const date = document.getElementById("reminder-date").value;
  const time = document.getElementById("reminder-time").value;
  const comment = document.getElementById("reminder-comment").value.trim();

  // Для ліків
  const title = document.getElementById("reminder-title").value.trim();
  const selectedMedicine = medicineList.value;
  const freq = medicineFrequency.value;

  // Для візиту
  const selectedDoctor = doctorList.value;

  // Валідація
  if (!type || !date || !time) {
    showToast("Заповніть тип, дату і час", "error");
    return;
  }
  if (type === "visit") {
    if (!selectedDoctor) {
      showToast("Оберіть лікаря", "error");
      return;
    }
  }
  if (type === "medicine") {
    if (!selectedMedicine) {
      showToast("Оберіть ліки зі списку", "error");
      return;
    }
    if (!freq) {
      showToast("Оберіть частоту прийому", "error");
      return;
    }
    if (!title) {
      showToast("Вкажіть назву (уточнення) для ліків", "error");
      return;
    }
  }

  // Формування рядка таблиці
  const tr = document.createElement("tr");
  const typeLabel = formatTypeLabel(type);

  let nameCell = "";
  if (type === "visit") {
    nameCell = selectedDoctor;
    if (comment) nameCell += ` — Коментар: ${comment}`;
  } else {
    // Для ліків показуємо: Назва — Ліки (частота)
    nameCell = `${title} — ${selectedMedicine} (${freq})`;
    if (comment) nameCell += ` — Коментар: ${comment}`;
  }

  tr.innerHTML = `
    <td>${typeLabel}</td>
    <td>${nameCell}</td>
    <td>${date}</td>
    <td>${time}</td>
    <td><button class="secondary-action delete-row">Видалити</button></td>
  `;
  scheduleBody.appendChild(tr);

  // Видалення рядка
  tr.querySelector(".delete-row").addEventListener("click", () => {
    tr.remove();
    showToast("Нагадування видалено", "info");
  });

  // Закрити і очистити форму
  scheduleDialog.close();
  scheduleForm.reset();
  titleField.hidden = true;
  doctorField.hidden = true;
  medicineField.hidden = true;

  showToast("Нагадування додано", "success");
});

// Скасування
cancelScheduleBtn.addEventListener("click", () => scheduleDialog.close());

// ============================
// Пошук по таблиці нагадувань
// ============================

function filterTable(query) {
  const q = (query || "").trim().toLowerCase();
  Array.from(scheduleBody.querySelectorAll("tr")).forEach(tr => {
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(q) ? "" : "none";
  });
}

searchBtn.addEventListener("click", () => filterTable(searchInput.value));
searchInput.addEventListener("input", () => filterTable(searchInput.value));

// ============================
// Допоміжна: наповнення select
// ============================

function populateSelect(selectEl, items, placeholder) {
  const html = [`<option value="">${placeholder}</option>`]
    .concat(items.map(i => `<option>${i}</option>`))
    .join("");
  selectEl.innerHTML = html;
}

// ============================
// Ініціалізація
// ============================

document.addEventListener("DOMContentLoaded", () => {
  // Початкове приховування залежних секцій
  titleField.hidden = true;
  doctorField.hidden = true;
  medicineField.hidden = true;

  // Наповнити повні списки на старті
  populateSelect(doctorList, DOCTORS, "— Оберіть лікаря —");
  populateSelect(medicineList, MEDICINES, "— Оберіть ліки —");
});
