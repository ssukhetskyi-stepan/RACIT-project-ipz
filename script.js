// ============================
// Здоровенькі були — script.js
// ============================

// ----------------------------
// Firebase конфіг
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCMBo0gOn43_ovP4MiZpeGRRKX4EMjRxFg",
  authDomain: "stepanproject-e1a89.firebaseapp.com",
  projectId: "stepanproject-e1a89",
  storageBucket: "stepanproject-e1a89.firebasestorage.app",
  messagingSenderId: "910486338176",
  appId: "1:910486338176:web:6d9456735d172736d94465",
  measurementId: "G-E311946XF3"
};

let firebaseReady = false;
let authApi = null;
let db = null;

(function initFirebase() {
  try {
    if (typeof firebase !== "undefined" && firebase?.initializeApp) {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      authApi = firebase.auth();
      db = firebase.firestore();
      firebaseReady = true;
      console.log("✅ Firebase initialized");
    } else {
      console.warn("Firebase SDK not found. Using demo auth.");
    }
  } catch (e) {
    console.warn("Firebase init failed. Using demo auth.", e);
  }
})();

// ----------------------------
// Елементи DOM
// ----------------------------
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");

const loginDialog = document.getElementById("login-dialog");
const authDialog = document.getElementById("auth-dialog");
const profileDialog = document.getElementById("profile-dialog");
const scheduleDialog = document.getElementById("schedule-dialog");

const cancelLoginBtn = document.querySelector(".cancel-login");
const cancelRegisterBtn = document.querySelector(".cancel-register");
const cancelScheduleBtn = document.getElementById("cancel-schedule");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const scheduleForm = document.getElementById("schedule-form");

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

const fileInput = document.getElementById("profile-photo-upload");
const fileNameSpan = document.getElementById("file-name");
const closeProfileBtn = document.getElementById("close-profile");
const profileGenderText = document.getElementById("profile-gender-text");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const toastContainer = document.getElementById("toast-container");

// ----------------------------
// Тости
// ----------------------------
function showToast(message, type = "info") {
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  t.textContent = message;
  toastContainer.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, 3000);
}

// ----------------------------
// Допоміжні
// ----------------------------
const normalize = (s) => (s || "").toLowerCase().trim();

const formatTypeLabel = (type) =>
  type === "visit" ? "Візит" : type === "medicine" ? "Ліки" : "—";

function populateDoctors(items) {
  if (!doctorList) return;
  doctorList.innerHTML =
    `<option value="">— Оберіть лікаря —</option>` +
    items.map(d => `<option value="${d}">${d}</option>`).join("");
}

function populateMedicines(items) {
  if (!medicineList) return;
  medicineList.innerHTML =
    `<option value="">— Оберіть ліки —</option>` +
    items
      .map(m => {
        const label = `${m.ua} (${m.latin})`;
        return `<option value="${label}">${label}</option>`;
      })
      .join("");
}

function autoselectFirstOption(selectEl) {
  if (!selectEl) return;
  selectEl.selectedIndex = selectEl.options.length > 1 ? 1 : 0;
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
}

function bestDoctorMatches(q) {
  const nq = normalize(q);
  const starts = DOCTORS.filter(d => normalize(d).startsWith(nq));
  if (starts.length) return starts;
  const contains = DOCTORS.filter(d => normalize(d).includes(nq));
  if (contains.length) return contains;
  return DOCTORS;
}

function bestMedicineMatches(q) {
  const nq = normalize(q);
  const starts = MEDICINES.filter(m =>
    normalize(m.ua).startsWith(nq) || normalize(m.latin).startsWith(nq)
  );
  if (starts.length) return starts;
  const contains = MEDICINES.filter(m =>
    normalize(m.ua).includes(nq) || normalize(m.latin).includes(nq)
  );
  if (contains.length) return contains;
  return MEDICINES;
}

// ----------------------------
// Дані
// ----------------------------
const DOCTORS = [
  "Іваненко Петро (Кардіолог)",
  "Петренко Олег (Терапевт)",
  "Сидоренко Андрій (Хірург)",
  "Ковальчук Марія (Офтальмолог)",
  "Бондаренко Ірина (Невролог)",
  "Мельник Олександр (Педіатр)",
  "Гриценко Оксана (Дерматолог)",
  "Шевченко Дмитро (Ендокринолог)",
  "Кравченко Наталія (Гінеколог)",
  "Лисенко Сергій (Уролог)",
  "Ткаченко Юлія (Отоларинголог)",
  "Романенко Богдан (Психіатр)",
  "Поліщук Ольга (Ревматолог)",
  "Захаренко Іван (Інфекціоніст)",
  "Данилюк Катерина (Гастроентеролог)",
  "Мазуренко Павло (Пульмонолог)",
  "Онищенко Світлана (Нефролог)",
  "Сергієнко Максим (Стоматолог)",
  "Яковенко Анна (Онколог)",
  "Мороз Віктор (Алерголог)"
];

const MEDICINES = [
  { ua: "Ібупрофен", latin: "Ibuprofen" },
  { ua: "Парацетамол", latin: "Paracetamol" },
  { ua: "Аспірин", latin: "Acetylsalicylic acid" },
  { ua: "Амоксицилін", latin: "Amoxicillin" },
  { ua: "Амоксиклав", latin: "Amoxicillin/Clavulanate" },
  { ua: "Азитроміцин", latin: "Azithromycin" },
  { ua: "Доксициклін", latin: "Doxycycline" },
  { ua: "Ципрофлоксацин", latin: "Ciprofloxacin" },
  { ua: "Кларитроміцин", latin: "Clarithromycin" },
  { ua: "Цефтріаксон", latin: "Ceftriaxone" },
  { ua: "Метформін", latin: "Metformin" },
  { ua: "Левотироксин", latin: "Levothyroxine" },
  { ua: "Аторвастатин", latin: "Atorvastatin" },
  { ua: "Симвастатин", latin: "Simvastatin" },
  { ua: "Росувастатин", latin: "Rosuvastatin" },
  { ua: "Омепразол", latin: "Omeprazole" },
  { ua: "Пантопразол", latin: "Pantoprazole" },
  { ua: "Езомепразол", latin: "Esomeprazole" },
  { ua: "Ранитидин", latin: "Ranitidine" },
  { ua: "Лозартан", latin: "Losartan" },
  { ua: "Валсартан", latin: "Valsartan" },
  { ua: "Кандесартан", latin: "Candesartan" },
  { ua: "Амлодипін", latin: "Amlodipine" },
  { ua: "Ніфедипін", latin: "Nifedipine" },
  { ua: "Метопролол", latin: "Metoprolol" },
  { ua: "Бісопролол", latin: "Bisoprolol" },
  { ua: "Атенолол", latin: "Atenolol" },
  { ua: "Карведилол", latin: "Carvedilol" },
  { ua: "Фуросемід", latin: "Furosemide" },
  { ua: "Торасемід", latin: "Torasemide" },
  { ua: "Спіронолактон", latin: "Spironolactone" },
  { ua: "Гідрохлортіазид", latin: "Hydrochlorothiazide" },
  { ua: "Преднізолон", latin: "Prednisolone" },
  { ua: "Дексаметазон", latin: "Dexamethasone" },
  { ua: "Гідрокортизон", latin: "Hydrocortisone" },
  { ua: "Будесонід", latin: "Budesonide" },
  { ua: "Салбутамол", latin: "Salbutamol" },
  { ua: "Формотерол", latin: "Formoterol" },
  { ua: "Іпратропіум", latin: "Ipratropium" },
  { ua: "Нітрогліцерин", latin: "Nitroglycerin" },
  { ua: "Ізосорбіду мононітрат", latin: "Isosorbide mononitrate" },
  { ua: "Варфарин", latin: "Warfarin" },
  { ua: "Апіксабан", latin: "Apixaban" },
  { ua: "Клопідогрел", latin: "Clopidogrel" },
  { ua: "Диклофенак", latin: "Diclofenac" },
  { ua: "Напроксен", latin: "Naproxen" },
  { ua: "Кеторолак", latin: "Ketorolac" },
  { ua: "Мелоксикам", latin: "Meloxicam" },
  { ua: "Німесулід", latin: "Nimesulide" },
  { ua: "Цетиризин", latin: "Cetirizine" },
  { ua: "Лоратадин", latin: "Loratadine" },
  { ua: "Фексофенадин", latin: "Fexofenadine" },
  { ua: "Діазолін", latin: "Diazolin" },
  { ua: "Активоване вугілля", latin: "Activated charcoal" },
  { ua: "Смекта (діосмектит)", latin: "Diosmectite" },
  { ua: "Лоперамід", latin: "Loperamide" },
  { ua: "Метоклопрамід", latin: "Metoclopramide" },
  { ua: "Ондансетрон", latin: "Ondansetron" },
  { ua: "Регідрон", latin: "Oral rehydration salts" }
];

// ----------------------------
// Авторизація
// ----------------------------
let demoUser = null;

function setUiAuthState(isLoggedIn, displayName, email) {
  if (profileBtn) profileBtn.hidden = !isLoggedIn;
  if (logoutBtn) logoutBtn.hidden = !isLoggedIn;
  if (addReminderBtn) addReminderBtn.hidden = !isLoggedIn;

  if (loginBtn) loginBtn.hidden = isLoggedIn;
  if (registerBtn) registerBtn.hidden = isLoggedIn;
}

loginBtn?.addEventListener("click", () => loginDialog?.showModal());
cancelLoginBtn?.addEventListener("click", () => loginDialog?.close());

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Заповніть email і пароль", "error");
    return;
  }

  if (firebaseReady && authApi) {
    try {
      const res = await authApi.signInWithEmailAndPassword(email, password);
      const user = res.user;
      setUiAuthState(true, user.displayName || "", user.email || email);
      loginDialog?.close();
      showToast("Вітаємо! Ви увійшли.", "success");
    } catch (err) {
      console.error(err);
      showToast("Помилка входу", "error");
    }
  } else {
    demoUser = { email, displayName: "Користувач", gender: "" };
    setUiAuthState(true, demoUser.displayName, demoUser.email);
    loginDialog?.close();
    showToast("Демо-вхід виконано.", "success");
  }
});

registerBtn?.addEventListener("click", () => authDialog?.showModal());
cancelRegisterBtn?.addEventListener("click", () => authDialog?.close());

registerForm?.addEventListener("submit", async (e) => {
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

  if (firebaseReady && authApi && db) {
    try {
      const res = await authApi.createUserWithEmailAndPassword(email, password);
      const user = res.user;

      await user.updateProfile({ displayName: `${firstname} ${lastname}` });

      try {
        await user.sendEmailVerification();
      } catch (e) {
        console.warn("Не вдалося надіслати лист підтвердження", e);
      }

      try {
        await db.collection("users").doc(user.uid).set({
          firstName: firstname,
          lastName: lastname,
          email,
          gender,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn("Не вдалося зберегти профіль у Firestore", e);
      }

      try {
        console.log("emailjs before send:", typeof emailjs);
        if (typeof emailjs !== "undefined") {
          await emailjs.send("service_zhlkz34", "template_eoottvf", {
            to_name: firstname,
            to_email: email,
            message: `Вітаємо у сервісі Здоровенькі Були!`,
          });
          console.log("✅ Welcome email sent successfully");
        } else {
          console.warn("EmailJS SDK не завантажився (emailjs === undefined)");
        }
      } catch (e) {
        console.warn("EmailJS welcome email failed:", e);
      }

      setUiAuthState(true, user.displayName || `${firstname} ${lastname}`, user.email || email);
      authDialog?.close();
      showToast("Реєстрація успішна! Лист підтвердження надіслано.", "success");
    } catch (err) {
      console.error(err);
      showToast("Помилка при реєстрації", "error");
    }
  } else {
    demoUser = { email, displayName: `${firstname} ${lastname}`, gender };
    setUiAuthState(true, demoUser.displayName, demoUser.email);
    authDialog?.close();
    showToast("Демо-реєстрація: лист не надсилається без Firebase.", "info");
  }
});

logoutBtn?.addEventListener("click", async () => {
  if (firebaseReady && authApi) {
    try {
      await authApi.signOut();
    } catch (e) {
      console.warn("SignOut error", e);
    }
  }
  demoUser = null;
  setUiAuthState(false);
  showToast("Ви вийшли з акаунта.", "info");
});

// ----------------------------
// Профіль (діалог)
// ----------------------------
profileBtn?.addEventListener("click", async () => {
  const isFirebaseUser = firebaseReady && authApi?.currentUser;
  let user = null;
  let genderValue = "";

  if (isFirebaseUser) {
    user = authApi.currentUser;
    if (db && user?.uid) {
      try {
        const docSnap = await db.collection("users").doc(user.uid).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          genderValue = data.gender || "";
        }
      } catch (e) {
        console.warn("Не вдалося завантажити профіль користувача", e);
      }
    }
  } else {
    user = demoUser;
    genderValue = demoUser?.gender || "";
  }

  if (!user) {
    showToast("Увійдіть, щоб переглянути профіль", "info");
    return;
  }

  const [firstname = "", lastname = ""] = (user.displayName || "").split(" ");
  document.getElementById("profile-firstname").textContent = firstname;
  document.getElementById("profile-lastname").textContent = lastname;
  document.getElementById("profile-email").textContent = user.email || "";

  if (profileGenderText) {
    let text = "Не вказано";
    if (genderValue === "male") text = "Чоловіча";
    else if (genderValue === "female") text = "Жіноча";
    profileGenderText.textContent = text;
  }

  profileDialog?.showModal();
});

closeProfileBtn?.addEventListener("click", () => profileDialog?.close());

fileInput?.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profile-photo").src = e.target.result;
      showToast("Аватар оновлено", "success");
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    fileNameSpan.textContent = "Файл не обрано";
  }
});

// ----------------------------
// Нагадування
// ----------------------------
addReminderBtn?.addEventListener("click", () => {
  if (reminderType) reminderType.value = "";
  if (titleField) titleField.hidden = true;
  if (doctorField) doctorField.hidden = true;
  if (medicineField) medicineField.hidden = true;

  if (doctorSearch) doctorSearch.value = "";
  if (medicineSearch) medicineSearch.value = "";

  populateDoctors(DOCTORS);
  populateMedicines(MEDICINES);

  if (doctorList) doctorList.selectedIndex = 0;
  if (medicineList) medicineList.selectedIndex = 0;
  if (medicineFrequency) medicineFrequency.selectedIndex = 0;

  scheduleDialog?.showModal();
});

reminderType?.addEventListener("change", (e) => {
  const v = e.target.value;
  if (titleField) titleField.hidden = v !== "medicine";
  if (doctorField) doctorField.hidden = v !== "visit";
  if (medicineField) medicineField.hidden = v !== "medicine";

  if (v === "visit") {
    const matches = bestDoctorMatches(doctorSearch?.value || "");
    populateDoctors(matches);
    autoselectFirstOption(doctorList);
  } else if (v === "medicine") {
    const matches = bestMedicineMatches(medicineSearch?.value || "");
    populateMedicines(matches);
    autoselectFirstOption(medicineList);
  }
});

// live-пошук лікарів
doctorSearch?.addEventListener("input", () => {
  const matches = bestDoctorMatches(doctorSearch.value);
  populateDoctors(matches);
  autoselectFirstOption(doctorList);
});
doctorSearch?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const matches = bestDoctorMatches(doctorSearch.value);
    populateDoctors(matches);
    autoselectFirstOption(doctorList);
  }
});

// live-пошук ліків
medicineSearch?.addEventListener("input", () => {
  const matches = bestMedicineMatches(medicineSearch.value);
  populateMedicines(matches);
  autoselectFirstOption(medicineList);
});
medicineSearch?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const matches = bestMedicineMatches(medicineSearch.value);
    populateMedicines(matches);
    autoselectFirstOption(medicineList);
  }
});

// збереження нагадування
scheduleForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = reminderType?.value;
  const date = document.getElementById("reminder-date").value;
  const time = document.getElementById("reminder-time").value;
  const comment = document.getElementById("reminder-comment").value.trim();

  const title = document.getElementById("reminder-title").value.trim();
  const selDoc = doctorList?.value || "";
  const selMed = medicineList?.value || "";
  const freq = medicineFrequency?.value || "";

  if (!type || !date || !time) {
    showToast("Заповніть тип, дату і час", "error");
    return;
  }
  if (type === "visit" && !selDoc) {
    showToast("Оберіть лікаря", "error");
    return;
  }
  if (type === "medicine") {
    if (!selMed) {
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

  let nameCell = "";
  if (type === "visit") {
    nameCell = selDoc;
  } else {
    nameCell = `${title} — ${selMed} (${freq})`;
  }
  if (comment) nameCell += ` — Коментар: ${comment}`;

  if (scheduleBody) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatTypeLabel(type)}</td>
      <td>${nameCell}</td>
      <td>${date}</td>
      <td>${time}</td>
      <td><button class="secondary-action delete-row">Видалити</button></td>
    `;
    scheduleBody.appendChild(tr);

    tr.querySelector(".delete-row").addEventListener("click", () => {
      tr.remove();
      showToast("Нагадування видалено", "info");
    });
  }

  const currentUser = firebaseReady && authApi ? authApi.currentUser : null;
  if (currentUser && db) {
    try {
      await db.collection("reminders").add({
        uid: currentUser.uid,
        type,
        date,
        time,
        title: type === "medicine" ? title : "",
        doctor: type === "visit" ? selDoc : "",
        medicine: type === "medicine" ? selMed : "",
        frequency: type === "medicine" ? freq : "",
        comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn("Не вдалося зберегти нагадування у Firestore", err);
    }
  }

  scheduleDialog?.close();
  scheduleForm.reset();
  if (titleField) titleField.hidden = true;
  if (doctorField) doctorField.hidden = true;
  if (medicineField) medicineField.hidden = true;
  showToast("Нагадування додано", "success");
});

cancelScheduleBtn?.addEventListener("click", () => scheduleDialog?.close());

// ----------------------------
// Пошук у таблиці
// ----------------------------
function filterTable(query) {
  const q = normalize(query);
  if (!scheduleBody) return;
  Array.from(scheduleBody.querySelectorAll("tr")).forEach(tr => {
    const text = normalize(tr.textContent);
    tr.style.display = text.includes(q) ? "" : "none";
  });
}
searchBtn?.addEventListener("click", () => filterTable(searchInput.value));
searchInput?.addEventListener("input", () => filterTable(searchInput.value));

// ----------------------------
// Ініціалізація
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (titleField) titleField.hidden = true;
  if (doctorField) doctorField.hidden = true;
  if (medicineField) medicineField.hidden = true;

  if (addReminderBtn) addReminderBtn.hidden = true;

  populateDoctors(DOCTORS);
  populateMedicines(MEDICINES);

  doctorSearch?.addEventListener("focus", () => {
    if (doctorSearch.value) {
      const matches = bestDoctorMatches(doctorSearch.value);
      populateDoctors(matches);
      autoselectFirstOption(doctorList);
    }
  });
  medicineSearch?.addEventListener("focus", () => {
    if (medicineSearch.value) {
      const matches = bestMedicineMatches(medicineSearch.value);
      populateMedicines(matches);
      autoselectFirstOption(medicineList);
    }
  });
});
