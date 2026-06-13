// ============================
// Здоровенькі були — script.js
// ============================

// ----------------------------
// Firebase конфіг
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyALT4nNnGuiqpLN4S1QFm4el9742xB20vI",
  authDomain: "zdorovenki-buly-app.firebaseapp.com",
  projectId: "zdorovenki-buly-app",
  storageBucket: "zdorovenki-buly-app.firebasestorage.app",
  messagingSenderId: "634015822794",
  appId: "1:634015822794:web:32f4debc3910731f4a1533"
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
      console.log("Firebase initialized");
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
const loginBtn        = document.getElementById("login-btn");
const registerBtn     = document.getElementById("register-btn");
const logoutBtn       = document.getElementById("logout-btn");
const profileBtn      = document.getElementById("profile-btn");

const loginDialog     = document.getElementById("login-dialog");
const authDialog      = document.getElementById("auth-dialog");
const profileDialog   = document.getElementById("profile-dialog");
const scheduleDialog  = document.getElementById("schedule-dialog");
const confirmDialog   = document.getElementById("confirm-dialog");
const forgotDialog    = document.getElementById("forgot-dialog");

const cancelLoginBtn    = document.querySelector(".cancel-login");
const cancelRegisterBtn = document.querySelector(".cancel-register");
const cancelScheduleBtn = document.getElementById("cancel-schedule");

const loginForm    = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const scheduleForm = document.getElementById("schedule-form");
const forgotForm   = document.getElementById("forgot-form");

const addReminderBtn    = document.getElementById("add-reminder-btn");
const reminderType      = document.getElementById("reminder-type");

const doctorField   = document.getElementById("doctor-field");
const doctorSearch  = document.getElementById("doctor-search");
const doctorList    = document.getElementById("doctor-list");

const medicineField     = document.getElementById("medicine-field");
const medicineSearch    = document.getElementById("medicine-search");
const medicineList      = document.getElementById("medicine-list");
const medicineFrequency = document.getElementById("medicine-frequency");
const dosageStandardField = document.getElementById("dosage-standard-field");
const dosageDropsField    = document.getElementById("dosage-drops-field");

const scheduleBody = document.getElementById("schedule-body");

const fileInput       = document.getElementById("profile-photo-upload");
const fileNameSpan    = document.getElementById("file-name");
const closeProfileBtn = document.getElementById("close-profile");
const profileGenderText = document.getElementById("profile-gender-text");

const searchInput = document.getElementById("search-input");
const searchBtn   = document.getElementById("search-btn");

const toastContainer = document.getElementById("toast-container");

// ----------------------------
// Тости
// ----------------------------
function showToast(message, type = "info", duration = 3000) {
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  t.textContent = message;
  toastContainer.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, duration);
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
    '<option value="">— Оберіть лікаря —</option>' +
    items.map(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      return opt.outerHTML;
    }).join("");
}

function populateMedicines(items) {
  if (!medicineList) return;
  medicineList.innerHTML =
    '<option value="">— Оберіть ліки —</option>' +
    items.map(m => {
      const label = `${m.ua} (${m.latin})`;
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      return opt.outerHTML;
    }).join("");
}

function autoselectFirstOption(selectEl) {
  if (!selectEl) return;
  selectEl.selectedIndex = selectEl.options.length > 1 ? 1 : 0;
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
}

function bestDoctorMatches(q) {
  const nq = normalize(q);
  if (!nq) return DOCTORS;
  const starts = DOCTORS.filter(d => normalize(d).startsWith(nq));
  if (starts.length) return starts;
  return DOCTORS.filter(d => normalize(d).includes(nq));
}

function bestMedicineMatches(q) {
  const nq = normalize(q);
  if (!nq) return MEDICINES;
  const starts = MEDICINES.filter(m =>
    normalize(m.ua).startsWith(nq) || normalize(m.latin).startsWith(nq)
  );
  if (starts.length) return starts;
  return MEDICINES.filter(m =>
    normalize(m.ua).includes(nq) || normalize(m.latin).includes(nq)
  );
}

// ----------------------------
// Дані: лікарі
// ----------------------------
const DOCTORS = [
  // Загальний список
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
  "Мороз Віктор (Алерголог)",
  // РОКЛДЦ ім. В. Поліщука, Рівне (вул. 16 Липня, 36)
  "Береська Оксана Ростиславівна — РОКЛДЦ (Хірург)",
  "Білик Юрій Романович — РОКЛДЦ (Уролог)",
  "Богдан Ігор Володимирович — РОКЛДЦ (Кардіолог)",
  "Бойко Вікторія Анатоліївна — РОКЛДЦ (Отоларинголог)",
  "Вовчанська Світлана Євгенівна — РОКЛДЦ (Спортивна медицина)",
  "Гаврюшенко Ганна Сергіївна — РОКЛДЦ (Генетик)",
  "Гажо Оксана Степанівна — РОКЛДЦ (Алерголог, Імунолог)",
  "Генеральчук Федір Олександрович — РОКЛДЦ (Хірург)",
  "Гордієвич Тетяна Володимирівна — РОКЛДЦ (Невропатолог)",
  "Грановська Ірина В'ячеславівна — РОКЛДЦ (Психолог)",
  "Колобов Ярослав Всеволодович — РОКЛДЦ (Лікар-спеціаліст)",
  "Матвєйчук Марина Леонідівна — РОКЛДЦ (Сімейний лікар)",
  "Миськів Наталія Вікторівна — РОКЛДЦ (Лікар-спеціаліст)",
  "Павленко Ірина Миколаївна — РОКЛДЦ (Лікар-спеціаліст)",
  "Ціж Оксана Сергіївна — РОКЛДЦ (Лікар-спеціаліст)",
  "Ярощук Степан Артемович — РОКЛДЦ (УЗД-діагностика)",
  "Шевченко Світлана Костянтинівна — РОКЛДЦ (УЗД, завідувачка відділення)",
];

// ----------------------------
// Дані: ліки (з типами форм випуску)
// ----------------------------
// type: tablet | capsule | drops | inhaler | liquid | injection
const MEDICINES = [
  { ua: "Ібупрофен",              latin: "Ibuprofen",                  type: "tablet"    },
  { ua: "Парацетамол",            latin: "Paracetamol",                type: "tablet"    },
  { ua: "Аспірин",               latin: "Acetylsalicylic acid",       type: "tablet"    },
  { ua: "Амоксицилін",           latin: "Amoxicillin",                type: "capsule"   },
  { ua: "Амоксиклав",            latin: "Amoxicillin/Clavulanate",    type: "tablet"    },
  { ua: "Азитроміцин",           latin: "Azithromycin",               type: "tablet"    },
  { ua: "Доксициклін",           latin: "Doxycycline",                type: "capsule"   },
  { ua: "Ципрофлоксацин",        latin: "Ciprofloxacin",              type: "tablet"    },
  { ua: "Кларитроміцин",         latin: "Clarithromycin",             type: "tablet"    },
  { ua: "Цефтріаксон",           latin: "Ceftriaxone",                type: "injection" },
  { ua: "Метформін",             latin: "Metformin",                  type: "tablet"    },
  { ua: "Левотироксин",          latin: "Levothyroxine",              type: "tablet"    },
  { ua: "Аторвастатин",          latin: "Atorvastatin",               type: "tablet"    },
  { ua: "Симвастатин",           latin: "Simvastatin",                type: "tablet"    },
  { ua: "Росувастатин",          latin: "Rosuvastatin",               type: "tablet"    },
  { ua: "Омепразол",             latin: "Omeprazole",                 type: "capsule"   },
  { ua: "Пантопразол",           latin: "Pantoprazole",               type: "tablet"    },
  { ua: "Езомепразол",           latin: "Esomeprazole",               type: "capsule"   },
  { ua: "Ранитидин",             latin: "Ranitidine",                 type: "tablet"    },
  { ua: "Лозартан",              latin: "Losartan",                   type: "tablet"    },
  { ua: "Валсартан",             latin: "Valsartan",                  type: "tablet"    },
  { ua: "Кандесартан",           latin: "Candesartan",                type: "tablet"    },
  { ua: "Амлодипін",             latin: "Amlodipine",                 type: "tablet"    },
  { ua: "Ніфедипін",             latin: "Nifedipine",                 type: "tablet"    },
  { ua: "Метопролол",            latin: "Metoprolol",                 type: "tablet"    },
  { ua: "Бісопролол",            latin: "Bisoprolol",                 type: "tablet"    },
  { ua: "Атенолол",              latin: "Atenolol",                   type: "tablet"    },
  { ua: "Карведилол",            latin: "Carvedilol",                 type: "tablet"    },
  { ua: "Фуросемід",             latin: "Furosemide",                 type: "tablet"    },
  { ua: "Торасемід",             latin: "Torasemide",                 type: "tablet"    },
  { ua: "Спіронолактон",         latin: "Spironolactone",             type: "tablet"    },
  { ua: "Гідрохлортіазид",       latin: "Hydrochlorothiazide",        type: "tablet"    },
  { ua: "Преднізолон",           latin: "Prednisolone",               type: "tablet"    },
  { ua: "Дексаметазон",          latin: "Dexamethasone",              type: "tablet"    },
  { ua: "Гідрокортизон",         latin: "Hydrocortisone",             type: "liquid"    },
  { ua: "Будесонід (краплі)",    latin: "Budesonide drops",           type: "drops"     },
  { ua: "Салбутамол",            latin: "Salbutamol",                 type: "inhaler"   },
  { ua: "Формотерол",            latin: "Formoterol",                 type: "inhaler"   },
  { ua: "Іпратропіум",           latin: "Ipratropium",                type: "inhaler"   },
  { ua: "Нітрогліцерин",         latin: "Nitroglycerin",              type: "tablet"    },
  { ua: "Ізосорбіду мононітрат", latin: "Isosorbide mononitrate",     type: "tablet"    },
  { ua: "Варфарин",              latin: "Warfarin",                   type: "tablet"    },
  { ua: "Апіксабан",             latin: "Apixaban",                   type: "tablet"    },
  { ua: "Клопідогрел",           latin: "Clopidogrel",                type: "tablet"    },
  { ua: "Диклофенак",            latin: "Diclofenac",                 type: "tablet"    },
  { ua: "Напроксен",             latin: "Naproxen",                   type: "tablet"    },
  { ua: "Кеторолак",             latin: "Ketorolac",                  type: "tablet"    },
  { ua: "Мелоксикам",            latin: "Meloxicam",                  type: "tablet"    },
  { ua: "Німесулід",             latin: "Nimesulide",                 type: "tablet"    },
  { ua: "Цетиризин",             latin: "Cetirizine",                 type: "tablet"    },
  { ua: "Лоратадин",             latin: "Loratadine",                 type: "tablet"    },
  { ua: "Фексофенадин",          latin: "Fexofenadine",               type: "tablet"    },
  { ua: "Діазолін",              latin: "Diazolin",                   type: "tablet"    },
  { ua: "Активоване вугілля",    latin: "Activated charcoal",         type: "tablet"    },
  { ua: "Смекта (діосмектит)",   latin: "Diosmectite",                type: "liquid"    },
  { ua: "Лоперамід",             latin: "Loperamide",                 type: "tablet"    },
  { ua: "Метоклопрамід",         latin: "Metoclopramide",             type: "tablet"    },
  { ua: "Ондансетрон",           latin: "Ondansetron",                type: "tablet"    },
  { ua: "Регідрон",              latin: "Oral rehydration salts",     type: "liquid"    },
  // Краплі
  { ua: "Нафтизин (краплі)",     latin: "Naphazoline drops",          type: "drops"     },
  { ua: "Ксилометазолін (краплі)", latin: "Xylometazoline drops",     type: "drops"     },
  { ua: "Окомістин (краплі)",    latin: "Octenisept eye drops",       type: "drops"     },
  { ua: "Тобрекс (краплі)",      latin: "Tobramycin eye drops",       type: "drops"     },
  { ua: "Дексаметазон (краплі)", latin: "Dexamethasone eye drops",    type: "drops"     },
  { ua: "Отіпакс (вушні краплі)", latin: "Otipax ear drops",         type: "drops"     },
  { ua: "Анауран (вушні краплі)", latin: "Anauran ear drops",         type: "drops"     }
];

// ----------------------------
// Діалог очікування підтвердження email
// ----------------------------
const pendingDialog    = document.getElementById("pending-dialog");
const pendingEmailEl   = document.getElementById("pending-email");
const pendingResendBtn = document.getElementById("pending-resend-btn");
const pendingCloseBtn  = document.getElementById("pending-close-btn");

let pendingEmail = "";

function showPendingVerification(email) {
  pendingEmail = email;
  if (pendingEmailEl) pendingEmailEl.textContent = email;
  pendingDialog?.showModal();
}

pendingCloseBtn?.addEventListener("click", () => pendingDialog?.close());

pendingResendBtn?.addEventListener("click", async () => {
  if (!firebaseReady || !authApi || !pendingEmail) return;

  // Тимчасово входимо щоб відправити лист повторно
  try {
    pendingResendBtn.disabled = true;
    pendingResendBtn.textContent = "Надсилаємо...";

    const user = authApi.currentUser;
    if (user && !user.emailVerified) {
      await user.sendEmailVerification();
    }

    showToast("Лист надіслано повторно!", "success");
    pendingResendBtn.textContent = "Надіслано ✓";

    setTimeout(() => {
      pendingResendBtn.disabled = false;
      pendingResendBtn.textContent = "Надіслати ще раз";
    }, 30000);
  } catch (e) {
    console.warn("Resend failed", e);
    showToast("Не вдалося надіслати лист. Спробуйте пізніше.", "error");
    pendingResendBtn.disabled = false;
    pendingResendBtn.textContent = "Надіслати ще раз";
  }
});

// ----------------------------
// Банер підтвердження email
// ----------------------------
const verifyBanner    = document.getElementById("verify-banner");
const verifyEmailSpan = document.getElementById("verify-banner__email");
const verifyResendBtn = document.getElementById("verify-resend-btn");
const verifyCloseBtn  = document.getElementById("verify-close-btn");

function showVerifyBanner(email) {
  if (!verifyBanner) return;
  if (verifyEmailSpan) verifyEmailSpan.textContent = `Лист надіслано на: ${email}`;
  verifyBanner.hidden = false;
}

function hideVerifyBanner() {
  if (verifyBanner) verifyBanner.hidden = true;
}

verifyCloseBtn?.addEventListener("click", hideVerifyBanner);

verifyResendBtn?.addEventListener("click", async () => {
  const user = firebaseReady && authApi ? authApi.currentUser : null;
  if (!user) return;
  try {
    await user.sendEmailVerification();
    showToast("Лист надіслано повторно!", "success");
    verifyResendBtn.disabled = true;
    verifyResendBtn.textContent = "Надіслано ✓";
    setTimeout(() => {
      verifyResendBtn.disabled = false;
      verifyResendBtn.textContent = "Надіслати ще раз";
    }, 30000);
  } catch (e) {
    showToast("Не вдалося надіслати лист", "error");
    console.warn("Resend verification failed", e);
  }
});

// ----------------------------
// Live-валідація пароля при реєстрації
// ----------------------------
const regPasswordInput = document.getElementById("regPassword");

function checkPasswordRules(password) {
  const rules = {
    length: password.length >= 8,
    upper:  /[A-ZА-ЯЁЇІЄҐ]/.test(password),
    digit:  /[0-9]/.test(password)
  };

  const ruleLength = document.getElementById("rule-length");
  const ruleUpper  = document.getElementById("rule-upper");
  const ruleDigit  = document.getElementById("rule-digit");

  function applyRule(el, valid) {
    if (!el) return;
    el.classList.toggle("valid", valid);
    el.querySelector(".rule-icon").textContent = valid ? "✓" : "○";
  }

  applyRule(ruleLength, rules.length);
  applyRule(ruleUpper,  rules.upper);
  applyRule(ruleDigit,  rules.digit);

  // Оновлення смужки надійності
  const fill  = document.getElementById("strength-fill");
  const label = document.getElementById("strength-label");
  const score = Object.values(rules).filter(Boolean).length;

  if (fill && label) {
    fill.className  = "password-strength__fill";
    label.className = "password-strength__label";

    if (!password) {
      label.textContent = "Введіть пароль";
    } else if (score === 1) {
      fill.classList.add("password-strength__fill--weak");
      label.classList.add("password-strength__label--weak");
      label.textContent = "Слабкий";
    } else if (score === 2) {
      fill.classList.add("password-strength__fill--medium");
      label.classList.add("password-strength__label--medium");
      label.textContent = "Середній";
    } else if (score === 3) {
      fill.classList.add("password-strength__fill--strong");
      label.classList.add("password-strength__label--strong");
      label.textContent = "Надійний";
    }
  }

  return rules.length && rules.upper && rules.digit;
}

regPasswordInput?.addEventListener("input", () => {
  checkPasswordRules(regPasswordInput.value);
});

// Перемикає поля дозування залежно від типу обраних ліків
function updateDosageFields(selectedLabel) {
  const medicine = MEDICINES.find(m => `${m.ua} (${m.latin})` === selectedLabel);
  const isDrops = medicine?.type === "drops";

  if (dosageStandardField) dosageStandardField.hidden = isDrops;
  if (dosageDropsField)    dosageDropsField.hidden    = !isDrops;

  // Скидаємо значення прихованих полів
  if (isDrops) {
    const dosageSel = document.getElementById("reminder-dosage");
    if (dosageSel) dosageSel.value = "";
  } else {
    const dropsSel = document.getElementById("reminder-drops");
    if (dropsSel) dropsSel.value = "";
  }

  // Динамічно додаємо/прибираємо опції способу застосування в уточненнях
  const titleSel = document.getElementById("reminder-title");
  if (!titleSel) return;

  // Прибираємо стару групу способу застосування якщо є
  const oldGroup = titleSel.querySelector("optgroup[data-type='application']");
  if (oldGroup) oldGroup.remove();

  // Додаємо групу тільки для крапель
  if (isDrops) {
    const group = document.createElement("optgroup");
    group.label = "Спосіб застосування";
    group.dataset.type = "application";
    [
      "В обидва ока", "В праве око", "В ліве око",
      "В обидва вуха", "В праве вухо", "В ліве вухо",
      "В обидві ніздрі"
    ].forEach(text => {
      const opt = document.createElement("option");
      opt.textContent = text;
      group.appendChild(opt);
    });

    // Вставляємо перед групою "Інше"
    const inshiGroup = Array.from(titleSel.querySelectorAll("optgroup"))
      .find(g => g.label === "Інше");
    if (inshiGroup) {
      titleSel.insertBefore(group, inshiGroup);
    } else {
      titleSel.appendChild(group);
    }
  }

  // Скидаємо вибране уточнення
  titleSel.value = "";
}

// При зміні ліків — оновлюємо поля дозування
medicineList?.addEventListener("change", () => {
  updateDosageFields(medicineList.value);
});

// ----------------------------
// Авторизація
// ----------------------------
let demoUser = null;

function setUiAuthState(isLoggedIn) {
  if (profileBtn)   profileBtn.hidden   = !isLoggedIn;
  if (logoutBtn)    logoutBtn.hidden    = !isLoggedIn;
  if (loginBtn)     loginBtn.hidden     = isLoggedIn;
  if (registerBtn)  registerBtn.hidden  = isLoggedIn;

  // Керуємо кнопкою "Додати" через клас на body
  document.body.classList.toggle("is-logged-in", isLoggedIn);
}

// Вхід
loginBtn?.addEventListener("click", () => loginDialog?.showModal());
cancelLoginBtn?.addEventListener("click", () => loginDialog?.close());

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Заповніть email і пароль", "error");
    return;
  }

  if (firebaseReady && authApi) {
    try {
      const res = await authApi.signInWithEmailAndPassword(email, password);
      const user = res.user;

      // Блокуємо вхід якщо email не підтверджений
      if (!user.emailVerified) {
        await authApi.signOut();
        loginDialog?.close();
        loginForm.reset();
        showToast("⚠️ Акаунт ще не підтверджений. Перевірте пошту та перейдіть за посиланням у листі.", "error", 6000);
        return;
      }

      setUiAuthState(true);
      await loadRemindersFromFirestore(user.uid);
      await scheduleAllReminders(user);
      loginDialog?.close();
      loginForm.reset();
      showToast("Вітаємо! Ви увійшли.", "success");
    } catch (err) {
      console.error(err);
      const msg = err.code === "auth/wrong-password" || err.code === "auth/user-not-found"
        ? "Невірний email або пароль"
        : "Помилка входу. Спробуйте ще раз.";
      showToast(msg, "error");
    }
  } else {
    demoUser = { email, displayName: "Користувач", gender: "" };
    setUiAuthState(true);
    loginDialog?.close();
    loginForm.reset();
    showToast("Демо-вхід виконано.", "success");
  }
});

// Реєстрація
registerBtn?.addEventListener("click", () => authDialog?.showModal());
cancelRegisterBtn?.addEventListener("click", () => authDialog?.close());

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const firstname = document.getElementById("regFirstname").value.trim();
  const lastname  = document.getElementById("regLastname").value.trim();
  const email     = document.getElementById("regEmail").value.trim();
  const password  = document.getElementById("regPassword").value;
  const password2 = document.getElementById("regPassword2").value;
  const gender    = document.getElementById("regGender").value;

  if (!firstname || !lastname || !email || !password || !password2 || !gender) {
    showToast("Будь ласка, заповніть усі поля", "error");
    return;
  }
  if (password.length < 8) {
    showToast("Пароль має містити щонайменше 8 символів", "error");
    return;
  }
  if (!checkPasswordRules(password)) {
    showToast("Пароль не відповідає вимогам безпеки", "error");
    return;
  }
  if (password !== password2) {
    showToast("Паролі не збігаються", "error");
    return;
  }

  if (firebaseReady && authApi && db) {
    try {
      const res  = await authApi.createUserWithEmailAndPassword(email, password);
      const user = res.user;

      await user.updateProfile({ displayName: `${firstname} ${lastname}` });

      try { await user.sendEmailVerification(); }
      catch (e) { console.warn("Email verification failed", e); }

      try {
        await db.collection("users").doc(user.uid).set({
          firstName: firstname,
          lastName:  lastname,
          email,
          gender,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) { console.warn("Firestore profile save failed", e); }

      try {
        if (typeof emailjs !== "undefined") {
          await emailjs.send("service_94kacdt", "template_3bipia5", {
            to_name:  firstname,
            to_email: email,
            message:  "Ласкаво просимо до сервісу Здоровенькі були!"
          });
        }
      } catch (e) { console.warn("EmailJS failed", e); }

      setUiAuthState(false);
      authDialog?.close();
      registerForm.reset();
      checkPasswordRules("");

      // Одразу виходимо — користувач не авторизований до підтвердження email
      try { await authApi.signOut(); }
      catch (e) { console.warn("SignOut after register failed", e); }

      // Показуємо діалог очікування підтвердження
      showPendingVerification(email);
      showToast("Лист надіслано! Перевірте пошту.", "success");
    } catch (err) {
      console.error(err);
      const msg = err.code === "auth/email-already-in-use"
        ? "Цей email вже зареєстровано"
        : "Помилка при реєстрації";
      showToast(msg, "error");
    }
  } else {
    demoUser = { email, displayName: `${firstname} ${lastname}`, gender };
    setUiAuthState(true);
    authDialog?.close();
    registerForm.reset();
    showToast("Демо-реєстрація виконана.", "info");
  }
});

// Вихід
logoutBtn?.addEventListener("click", async () => {
  if (firebaseReady && authApi) {
    try { await authApi.signOut(); }
    catch (e) { console.warn("SignOut error", e); }
  }
  demoUser = null;
  setUiAuthState(false);
  clearAllReminderTimers();
  if (scheduleBody) {
    scheduleBody.innerHTML = `<tr class="empty-state-row"><td colspan="5"><div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__text">Нагадувань ще немає.<br>Натисніть «+ Додати», щоб створити перше.</div></div></td></tr>`;
  }
  updateStats();
  showToast("Ви вийшли з акаунта.", "info");
});

// ----------------------------
// Забули пароль
// ----------------------------
document.getElementById("forgot-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  loginDialog?.close();
  forgotDialog?.showModal();
});

document.getElementById("cancel-forgot")?.addEventListener("click", () => {
  forgotDialog?.close();
});

forgotForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value.trim();
  if (!email) { showToast("Введіть email", "error"); return; }

  if (firebaseReady && authApi) {
    try {
      await authApi.sendPasswordResetEmail(email);
      showToast("Лист для скидання пароля надіслано!", "success");
      forgotDialog?.close();
      forgotForm.reset();
    } catch (err) {
      console.error(err);
      const msg = err.code === "auth/user-not-found"
        ? "Акаунт з таким email не знайдено"
        : "Не вдалося надіслати лист. Перевірте email.";
      showToast(msg, "error");
    }
  } else {
    showToast("Функція доступна лише при підключеному Firebase.", "info");
  }
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
        const snap = await db.collection("users").doc(user.uid).get();
        if (snap.exists) genderValue = snap.data().gender || "";
      } catch (e) { console.warn("Profile load failed", e); }
    }
  } else {
    user = demoUser;
    genderValue = demoUser?.gender || "";
  }

  if (!user) { showToast("Увійдіть, щоб переглянути профіль", "info"); return; }

  const parts = (user.displayName || "").split(" ");
  document.getElementById("profile-firstname").textContent = parts[0] || "";
  document.getElementById("profile-lastname").textContent  = parts[1] || "";
  document.getElementById("profile-email").textContent     = user.email || "";

  if (profileGenderText) {
    profileGenderText.textContent =
      genderValue === "male" ? "Чоловіча" :
      genderValue === "female" ? "Жіноча" : "Не вказано";
  }

  profileDialog?.showModal();
});

closeProfileBtn?.addEventListener("click", () => profileDialog?.close());

fileInput?.addEventListener("change", () => {
  if (!fileInput.files.length) { fileNameSpan.textContent = "Файл не обрано"; return; }
  fileNameSpan.textContent = fileInput.files[0].name;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("profile-photo").src = e.target.result;
    showToast("Аватар оновлено", "success");
  };
  reader.readAsDataURL(fileInput.files[0]);
});

// ----------------------------
// Безпечне додавання рядка таблиці (без XSS)
// ----------------------------
function appendReminderRow({ type, nameCell, date, time, firestoreId }) {
  if (!scheduleBody) return;

  // Прибрати порожній стан якщо є
  const emptyRow = scheduleBody.querySelector(".empty-state-row");
  if (emptyRow) emptyRow.style.display = "none";

  const tr = document.createElement("tr");
  tr.dataset.firestoreId = firestoreId || "";
  tr.dataset.type = type;

  const tdType = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge badge--${type}`;
  badge.textContent = formatTypeLabel(type);
  tdType.appendChild(badge);

  const tdName = document.createElement("td");
  tdName.textContent = nameCell;

  const tdDate = document.createElement("td");
  tdDate.textContent = date;

  const tdTime = document.createElement("td");
  tdTime.textContent = time;

  const tdActions = document.createElement("td");
  tdActions.style.display = "flex";
  tdActions.style.gap = "0.4rem";
  tdActions.style.alignItems = "center";

  // Кнопка "Виконано / Активне"
  const doneBtn = document.createElement("button");
  doneBtn.className = "done-row";
  doneBtn.textContent = "✓";
  doneBtn.title = "Позначити як виконане";
  doneBtn.addEventListener("click", () => {
    const isDone = !!tr.dataset.done;
    if (isDone) {
      delete tr.dataset.done;
      tr.classList.remove("row--done");
      doneBtn.title = "Позначити як виконане";
      doneBtn.classList.remove("done-row--active");
    } else {
      tr.dataset.done = "1";
      tr.classList.add("row--done");
      doneBtn.title = "Позначити як активне";
      doneBtn.classList.add("done-row--active");
    }
    updateStats();
    sortAndFilter();
  });

  const delBtn = document.createElement("button");
  delBtn.className = "delete-row";
  delBtn.textContent = "Видалити";
  delBtn.addEventListener("click", () => {
    openConfirmDialog("Видалити це нагадування?", async () => {
      const fid = tr.dataset.firestoreId;
      if (fid && firebaseReady && db) {
        try { await db.collection("reminders").doc(fid).delete(); }
        catch (e) { console.warn("Firestore delete failed", e); }
      }
      tr.remove();
      updateStats();
      showToast("Нагадування видалено", "info");
    });
  });

  tdActions.appendChild(doneBtn);
  tdActions.appendChild(delBtn);
  tr.append(tdType, tdName, tdDate, tdTime, tdActions);
  scheduleBody.appendChild(tr);
  updateStats();
}

// ----------------------------
// Діалог підтвердження видалення
// ----------------------------
let confirmCallback = null;

function openConfirmDialog(message, onConfirm) {
  const msgEl = document.getElementById("confirm-message");
  if (msgEl) msgEl.textContent = message;
  confirmCallback = onConfirm;
  confirmDialog?.showModal();
}

document.getElementById("confirm-yes")?.addEventListener("click", () => {
  confirmDialog?.close();
  if (typeof confirmCallback === "function") confirmCallback();
  confirmCallback = null;
});

document.getElementById("confirm-no")?.addEventListener("click", () => {
  confirmDialog?.close();
  confirmCallback = null;
});

// ----------------------------
// Завантаження нагадувань з Firestore
// ----------------------------
async function loadRemindersFromFirestore(uid) {
  if (!db || !scheduleBody) return;
  try {
    const snapshot = await db
      .collection("reminders")
      .where("uid", "==", uid)
      .orderBy("createdAt", "asc")
      .get();

    scheduleBody.innerHTML = "";

    if (snapshot.empty) {
      scheduleBody.innerHTML = `<tr class="empty-state-row"><td colspan="5"><div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__text">Нагадувань ще немає.<br>Натисніть «+ Додати», щоб створити перше.</div></div></td></tr>`;
      updateStats();
      return;
    }

    snapshot.forEach(doc => {
      const d = doc.data();
      let nameCell = d.type === "visit"
        ? (d.doctor || "")
        : `${d.dosage || d.title || ""}${d.title && d.dosage ? " · " + d.title : ""} — ${d.medicine} (${d.frequency})`;
      if (d.comment) nameCell += ` — Коментар: ${d.comment}`;
      appendReminderRow({ type: d.type, nameCell, date: d.date, time: d.time, firestoreId: doc.id });
    });
    updateStats();
  } catch (e) {
    console.warn("Firestore load failed", e);
  }
}

// ----------------------------
// Нагадування: відкрити форму
// ----------------------------
addReminderBtn?.addEventListener("click", () => {
  if (reminderType)     reminderType.value = "";

  if (doctorField)      doctorField.hidden  = true;
  if (medicineField)    medicineField.hidden = true;
  if (doctorSearch)     doctorSearch.value  = "";
  if (medicineSearch)   medicineSearch.value = "";

  // Скидаємо поля дозування
  if (dosageDropsField)    dosageDropsField.hidden    = true;
  if (dosageStandardField) dosageStandardField.hidden = false;
  const dosageSel = document.getElementById("reminder-dosage");
  const dropsSel  = document.getElementById("reminder-drops");
  const titleSel  = document.getElementById("reminder-title");
  if (dosageSel) dosageSel.value = "";
  if (dropsSel)  dropsSel.value  = "";
  if (titleSel)  titleSel.value  = "";

  populateDoctors(DOCTORS);
  populateMedicines(MEDICINES);

  // Відновлюємо мову
  applyTranslation(currentLang);

  // Ініціалізуємо QR-код
  initQRCode();

  if (doctorList)       doctorList.selectedIndex    = 0;
  if (medicineList)     medicineList.selectedIndex  = 0;
  if (medicineFrequency) medicineFrequency.selectedIndex = 0;

  scheduleDialog?.showModal();
});

reminderType?.addEventListener("change", (e) => {
  const v = e.target.value;

  if (doctorField)   doctorField.hidden   = v !== "visit";
  if (medicineField) medicineField.hidden = v !== "medicine";

  // Показуємо "Нагадати за" з потрібними опціями
  const remindField = document.getElementById("remind-ahead-field");
  const remindSel   = document.getElementById("remind-ahead");
  if (remindField && remindSel) {
    if (v === "medicine") {
      remindField.hidden = false;
      remindSel.innerHTML = `
        <option value="">— Не нагадувати заздалегідь —</option>
        <option value="5">За 5 хвилин</option>
        <option value="10">За 10 хвилин</option>
        <option value="30">За 30 хвилин</option>`;
    } else if (v === "visit") {
      remindField.hidden = false;
      remindSel.innerHTML = `
        <option value="">— Не нагадувати заздалегідь —</option>
        <option value="30">За 30 хвилин</option>
        <option value="60">За 60 хвилин</option>
        <option value="120">За 120 хвилин</option>`;
    } else {
      remindField.hidden = true;
      remindSel.value = "";
    }
  }

  if (v === "visit") {
    populateDoctors(bestDoctorMatches(doctorSearch?.value || ""));
    autoselectFirstOption(doctorList);
  } else if (v === "medicine") {
    populateMedicines(bestMedicineMatches(medicineSearch?.value || ""));
    autoselectFirstOption(medicineList);
  }
});

// Live-пошук лікарів
doctorSearch?.addEventListener("input", () => {
  populateDoctors(bestDoctorMatches(doctorSearch.value));
  autoselectFirstOption(doctorList);
});
doctorSearch?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  populateDoctors(bestDoctorMatches(doctorSearch.value));
  autoselectFirstOption(doctorList);
});

// Live-пошук ліків
medicineSearch?.addEventListener("input", () => {
  populateMedicines(bestMedicineMatches(medicineSearch.value));
  autoselectFirstOption(medicineList);
});
medicineSearch?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  populateMedicines(bestMedicineMatches(medicineSearch.value));
  autoselectFirstOption(medicineList);
});

// ----------------------------
// Нагадування: збереження
// ----------------------------
scheduleForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type        = reminderType?.value;
  const date        = document.getElementById("reminder-date").value;
  const time        = document.getElementById("reminder-time").value;
  const comment     = document.getElementById("reminder-comment").value.trim();
  const title       = document.getElementById("reminder-title").value;
  const dosage      = document.getElementById("reminder-dosage")?.value || "";
  const drops       = document.getElementById("reminder-drops")?.value  || "";
  const selDoc      = doctorList?.value || "";
  const selMed      = medicineList?.value || "";
  const freq        = medicineFrequency?.value || "";
  const remindAhead = parseInt(document.getElementById("remind-ahead")?.value || "0") || 0;

  // Визначаємо фінальне дозування (стандартне або краплі)
  const finalDosage = drops || dosage;

  if (!type || !date || !time) {
    showToast("Заповніть тип, дату і час", "error");
    return;
  }
  if (type === "visit" && !selDoc) {
    showToast("Оберіть лікаря", "error");
    return;
  }
  if (type === "medicine") {
    if (!selMed)       { showToast("Оберіть ліки зі списку", "error"); return; }
    if (!finalDosage)  { showToast("Оберіть дозування", "error"); return; }
    if (!freq)         { showToast("Оберіть частоту прийому", "error"); return; }
  }

  let nameCell = type === "visit"
    ? selDoc
    : `${finalDosage}${title ? " · " + title : ""} — ${selMed} (${freq})`;
  if (comment) nameCell += ` — Коментар: ${comment}`;

  let firestoreId = null;
  const currentUser = firebaseReady && authApi ? authApi.currentUser : null;
  if (currentUser && db) {
    try {
      const ref = await db.collection("reminders").add({
        uid:       currentUser.uid,
        type,
        date,
        time,
        title:       type === "medicine" ? title       : "",
        dosage:      type === "medicine" ? finalDosage : "",
        doctor:      type === "visit"    ? selDoc      : "",
        medicine:    type === "medicine" ? selMed      : "",
        frequency:   type === "medicine" ? freq        : "",
        remindAhead: remindAhead || 0,
        comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      firestoreId = ref.id;
    } catch (err) {
      console.warn("Firestore save failed", err);
    }
  }

  appendReminderRow({ type, nameCell, date, time, firestoreId });

  // Запланувати email для нового нагадування
  if (currentUser) {
    const userName = (currentUser.displayName || "").split(" ")[0] || "Користувач";
    const userEmailForReminder = currentUser.email
      || (authApi && authApi.currentUser && authApi.currentUser.email)
      || "";
    scheduleReminderEmail(
      { date, time, type, doctor: selDoc, medicine: selMed, title, firestoreId,
        dosage: finalDosage, frequency: freq, remindAhead },
      userEmailForReminder,
      userName
    );
  }

  scheduleDialog?.close();
  scheduleForm.reset();

  if (doctorField)   doctorField.hidden   = true;
  if (medicineField) medicineField.hidden = true;
  showToast("Нагадування додано", "success");
});

cancelScheduleBtn?.addEventListener("click", () => scheduleDialog?.close());

// ----------------------------
// Статистика
// ----------------------------
function updateStats() {
  if (!scheduleBody) return;
  const rows = Array.from(scheduleBody.querySelectorAll("tr[data-type]"));
  const total  = rows.length;
  const visits = rows.filter(r => r.dataset.type === "visit").length;
  const meds   = rows.filter(r => r.dataset.type === "medicine").length;

  const elTotal  = document.getElementById("stat-total");
  const elVisits = document.getElementById("stat-visits");
  const elMeds   = document.getElementById("stat-meds");

  if (elTotal)  elTotal.textContent  = total;
  if (elVisits) elVisits.textContent = visits;
  if (elMeds)   elMeds.textContent   = meds;

  // Показати/сховати порожній стан
  const emptyRow = scheduleBody.querySelector(".empty-state-row");
  if (emptyRow) emptyRow.style.display = total > 0 ? "none" : "";
}

// ----------------------------
// Пошук у таблиці
// ----------------------------
function filterTable(query) {
  const q = normalize(query);
  if (!scheduleBody) return;
  scheduleBody.querySelectorAll("tr[data-type]").forEach(tr => {
    const text = normalize(tr.textContent);
    const matchFilter = applySort(tr);
    tr.style.display = (text.includes(q) && matchFilter) ? "" : "none";
  });
}

// Повертає true якщо рядок відповідає поточному фільтру статусу
function applySort(tr) {
  const sortVal = document.getElementById("sort-select")?.value || "newest";
  if (sortVal === "active") return !tr.dataset.done;
  if (sortVal === "done")   return !!tr.dataset.done;
  return true;
}

// Сортування і фільтрація таблиці
function sortAndFilter() {
  if (!scheduleBody) return;
  const q       = normalize(searchInput?.value || "");
  const sortVal = document.getElementById("sort-select")?.value || "newest";
  const emptyRow = scheduleBody.querySelector(".empty-state-row");

  // Отримуємо лише рядки з даними
  let rows = Array.from(scheduleBody.querySelectorAll("tr[data-type]"));

  // Фільтр за текстом і статусом
  rows.forEach(tr => {
    const text       = normalize(tr.textContent);
    const matchText  = text.includes(q);
    const matchStatus =
      sortVal === "active" ? !tr.dataset.done :
      sortVal === "done"   ? !!tr.dataset.done : true;
    tr.style.display = (matchText && matchStatus) ? "" : "none";
  });

  // Видимі рядки для сортування
  let visible = rows.filter(tr => tr.style.display !== "none");

  // Сортування
  if (sortVal === "newest" || sortVal === "oldest") {
    visible.sort((a, b) => {
      const dateA = new Date((a.querySelector("td:nth-child(3)")?.textContent || "") + "T" + (a.querySelector("td:nth-child(4)")?.textContent || "00:00"));
      const dateB = new Date((b.querySelector("td:nth-child(3)")?.textContent || "") + "T" + (b.querySelector("td:nth-child(4)")?.textContent || "00:00"));
      return sortVal === "newest" ? dateB - dateA : dateA - dateB;
    });
  } else if (sortVal === "az" || sortVal === "za") {
    visible.sort((a, b) => {
      const nameA = normalize(a.querySelector("td:nth-child(2)")?.textContent || "");
      const nameB = normalize(b.querySelector("td:nth-child(2)")?.textContent || "");
      return sortVal === "az" ? nameA.localeCompare(nameB, "uk") : nameB.localeCompare(nameA, "uk");
    });
  }

  // Переставляємо рядки у відсортованому порядку
  visible.forEach(tr => scheduleBody.appendChild(tr));

  // Показуємо порожній стан якщо немає видимих
  if (emptyRow) {
    emptyRow.style.display = visible.length === 0 ? "" : "none";
  }
}

searchBtn?.addEventListener("click", () => sortAndFilter());
searchInput?.addEventListener("input", () => sortAndFilter());
document.getElementById("sort-select")?.addEventListener("change", () => sortAndFilter());

// ----------------------------
// Email-нагадування через EmailJS
// ----------------------------

const reminderTimers = [];

async function sendReminderEmail({ toEmail, toName, params }) {
  if (typeof emailjs === "undefined") {
    console.warn("EmailJS не завантажився");
    return;
  }
  try {
    await emailjs.send("service_94kacdt", "template_cr0pnkk", {
      to_name:  toName  || "Користувач",
      to_email: toEmail,
      ...params
    });
    console.log("Email-нагадування надіслано:", params.reminder_type);
  } catch (e) {
    console.warn("Email-нагадування не надіслано:", e);
  }
}

function scheduleReminderEmail(reminder, userEmail, userName) {
  const { date, time, type, doctor, medicine, title, remindAhead } = reminder;
  if (!date || !time) return;

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes]   = time.split(":").map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes, 0);

  // Відраховуємо remindAhead хвилин до події
  const aheadMs = (parseInt(remindAhead) || 0) * 60 * 1000;
  const triggerDate = new Date(eventDate.getTime() - aheadMs);
  const msUntil = triggerDate - Date.now();

  if (msUntil <= 0) return;

  const aheadLabel = aheadMs > 0
    ? ` (за ${parseInt(remindAhead)} хв до події)`
    : "";

  let emailParams;
  let toastBody;
  const rowStyle = "border-top:1px solid #d0e8f8;";
  const tdIcon  = `style="padding:7px 4px;font-size:16px;width:28px;vertical-align:middle;"`;
  const tdLabel = `style="padding:7px 8px;color:#555;font-size:14px;width:100px;vertical-align:middle;"`;
  const tdValue = `style="padding:7px 4px;font-weight:bold;color:#1a3a5c;font-size:14px;vertical-align:middle;"`;

  function makeRow(icon, label, value, first = false) {
    const tr = first ? `<tr>` : `<tr style="${rowStyle}">`;
    return `${tr}<td ${tdIcon}>${icon}</td><td ${tdLabel}>${label}</td><td ${tdValue}>${value}</td></tr>`;
  }

  let rows, icon, reminderType;

  if (type === "visit") {
    toastBody    = `Нагадування${aheadLabel}: час відвідати ${doctor}`;
    icon         = "🏥";
    reminderType = `Нагадування про візит до лікаря${aheadLabel}`;
    rows = makeRow("👨‍⚕️", "Лікар",   doctor || "—", true)
         + makeRow("📅",    "Дата",    date)
         + makeRow("🕐",    "Час",     time);
  } else {
    toastBody    = `Нагадування${aheadLabel}: час прийняти ${title || medicine}`;
    icon         = "💊";
    reminderType = `Нагадування про прийом ліків${aheadLabel}`;
    rows = makeRow("💊",    "Препарат",  medicine || title || "—", true)
         + makeRow("⚖️",   "Дозування", reminder.dosage    || "—")
         + makeRow("🔄",    "Частота",   reminder.frequency || "—")
         + makeRow("📅",    "Дата",      date)
         + makeRow("🕐",    "Час",       time);
  }

  emailParams = {
    icon,
    reminder_type: reminderType,
    rows,
    date,
    time
  };

  // Отримуємо актуальний email на момент спрацювання таймера
  const timerId = setTimeout(async () => {
    const email = userEmail
      || (authApi && authApi.currentUser && authApi.currentUser.email)
      || (demoUser && demoUser.email)
      || "";
    // Toast показуємо завжди
    showToast(toastBody, "info");
    if (!email) {
      console.warn("Email-нагадування: адреса отримувача невідома");
      return;
    }
    await sendReminderEmail({ toEmail: email, toName: userName, params: emailParams });
  }, msUntil);

  reminderTimers.push(timerId);
  console.log(`Заплановано нагадування через ${Math.round(msUntil / 60000)} хв:`, toastBody);
}

function clearAllReminderTimers() {
  reminderTimers.forEach(id => clearTimeout(id));
  reminderTimers.length = 0;
}

async function scheduleAllReminders(user) {
  if (!db || !user) return;
  clearAllReminderTimers();
  try {
    const snap = await db
      .collection("reminders")
      .where("uid", "==", user.uid)
      .get();
    const userName = (user.displayName || "").split(" ")[0] || "Користувач";
    snap.forEach(doc => {
      scheduleReminderEmail({ ...doc.data(), firestoreId: doc.id }, user.email, userName);
    });
  } catch (e) {
    console.warn("Не вдалося запланувати нагадування:", e);
  }
}

// ----------------------------
// Ініціалізація
// ----------------------------

// ----------------------------
// Система мов (UA / PL)
// ----------------------------
const TRANSLATIONS = {
  ua: {
    "login-btn":        "Увійти",
    "register-btn":     "Реєстрація",
    "logout-btn":       "Вийти",
    "profile-btn":      "Профіль",
    "declaration-btn":  "📋 Декларація з лікарем",
    "hero-title":       "Здоровенькі були",
    "hero-slogan":      "Ваш особистий помічник здоров'я — нагадування про ліки та візити до лікаря в одному місці",
    "hero-feat-1":      "Нагадування про прийом ліків",
    "hero-feat-2":      "Планування візитів до лікаря",
    "hero-feat-3":      "Ваш особистий профіль здоров'я",
    "hero-register":    "Зареєструватись безкоштовно",
    "hero-login":       "Увійти в акаунт",
    "qr-label":         "Відскануй для входу",
    "stat-total-lbl":   "Всього нагадувань",
    "stat-visits-lbl":  "Візитів до лікаря",
    "stat-meds-lbl":    "Прийомів ліків",
    "search-ph":        "Пошук нагадувань...",
    "search-btn":       "Пошук",
    "reminders-title":  "Ваші нагадування",
    "add-btn":          "+ Додати",
    "sort-newest":      "Новіші спочатку",
    "sort-oldest":      "Старіші спочатку",
    "sort-az":          "За алфавітом А→Я",
    "sort-za":          "За алфавітом Я→А",
    "sort-active":      "Ще триває",
    "sort-done":        "Виконано",
    "articles-title":   "📰 Корисні статті",
    "remind-none":      "— Не нагадувати заздалегідь —",
    "remind-5":         "За 5 хвилин",
    "remind-10":        "За 10 хвилин",
    "remind-30":        "За 30 хвилин",
    "remind-60":        "За 60 хвилин",
    "remind-120":       "За 120 хвилин",
  },
  pl: {
    "login-btn":        "Zaloguj",
    "register-btn":     "Rejestracja",
    "logout-btn":       "Wyloguj",
    "profile-btn":      "Profil",
    "declaration-btn":  "📋 Deklaracja do lekarza",
    "hero-title":       "Zdrowi Byli",
    "hero-slogan":      "Twój osobisty asystent zdrowia — przypomnienia o lekach i wizytach u lekarza w jednym miejscu",
    "hero-feat-1":      "Przypomnienia o przyjmowaniu leków",
    "hero-feat-2":      "Planowanie wizyt u lekarza",
    "hero-feat-3":      "Twój osobisty profil zdrowia",
    "hero-register":    "Zarejestruj się bezpłatnie",
    "hero-login":       "Zaloguj się",
    "qr-label":         "Zeskanuj, aby wejść",
    "stat-total-lbl":   "Wszystkich przypomnień",
    "stat-visits-lbl":  "Wizyt u lekarza",
    "stat-meds-lbl":    "Przyjęć leków",
    "search-ph":        "Szukaj przypomnień...",
    "search-btn":       "Szukaj",
    "reminders-title":  "Twoje przypomnienia",
    "add-btn":          "+ Dodaj",
    "sort-newest":      "Nowsze najpierw",
    "sort-oldest":      "Starsze najpierw",
    "sort-az":          "Alfabetycznie A→Z",
    "sort-za":          "Alfabetycznie Z→A",
    "sort-active":      "W trakcie",
    "sort-done":        "Wykonane",
    "articles-title":   "📰 Przydatne artykuły",
    "remind-none":      "— Nie przypominaj wcześniej —",
    "remind-5":         "Za 5 minut",
    "remind-10":        "Za 10 minut",
    "remind-30":        "Za 30 minut",
    "remind-60":        "Za 60 minut",
    "remind-120":       "Za 120 minut",
  }
};

let currentLang = localStorage.getItem("lang") || "ua";

function applyTranslation(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);

  const langBtn = document.getElementById("lang-btn");
  if (langBtn) langBtn.textContent = lang === "ua" ? "🇵🇱 PL" : "🇺🇦 UA";

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("login-btn",    t["login-btn"]);
  setTxt("register-btn", t["register-btn"]);
  setTxt("logout-btn",   t["logout-btn"]);
  setTxt("profile-btn",  t["profile-btn"]);

  const declBtn = document.querySelector(".declaration-btn");
  if (declBtn) declBtn.textContent = t["declaration-btn"];

  // Hero
  const heroTitle = document.querySelector(".hero-banner__title");
  if (heroTitle) heroTitle.textContent = t["hero-title"];
  const heroSlogan = document.querySelector(".hero-banner__slogan");
  if (heroSlogan) heroSlogan.textContent = t["hero-slogan"];
  const feats = document.querySelectorAll(".hero-banner__feature span:last-child");
  if (feats[0]) feats[0].textContent = t["hero-feat-1"];
  if (feats[1]) feats[1].textContent = t["hero-feat-2"];
  if (feats[2]) feats[2].textContent = t["hero-feat-3"];
  const heroReg = document.querySelector(".hero-register-btn");
  if (heroReg) heroReg.textContent = t["hero-register"];
  const heroLog = document.querySelector(".hero-login-btn");
  if (heroLog) heroLog.textContent = t["hero-login"];
  const qrLabel = document.querySelector(".hero-qr__label");
  if (qrLabel) qrLabel.textContent = t["qr-label"];

  // Статистика
  const statLabels = document.querySelectorAll(".stat-card__label");
  if (statLabels[0]) statLabels[0].textContent = t["stat-total-lbl"];
  if (statLabels[1]) statLabels[1].textContent = t["stat-visits-lbl"];
  if (statLabels[2]) statLabels[2].textContent = t["stat-meds-lbl"];

  // Пошук
  const srchInput = document.getElementById("search-input");
  if (srchInput) srchInput.placeholder = t["search-ph"];
  const srchBtn = document.getElementById("search-btn");
  if (srchBtn) srchBtn.textContent = t["search-btn"];

  // Таблиця
  const remTitle = document.querySelector(".visit-schedule h2");
  if (remTitle) remTitle.textContent = t["reminders-title"];
  const addBtn = document.getElementById("add-reminder-btn");
  if (addBtn) addBtn.textContent = t["add-btn"];

  // Сортування
  const sortSel = document.getElementById("sort-select");
  if (sortSel && sortSel.options.length >= 6) {
    sortSel.options[0].text = t["sort-newest"];
    sortSel.options[1].text = t["sort-oldest"];
    sortSel.options[2].text = t["sort-az"];
    sortSel.options[3].text = t["sort-za"];
    sortSel.options[4].text = t["sort-active"];
    sortSel.options[5].text = t["sort-done"];
  }

  // Статті
  const artTitle = document.querySelector(".articles-title");
  if (artTitle) artTitle.textContent = t["articles-title"];
}

document.getElementById("lang-btn")?.addEventListener("click", () => {
  applyTranslation(currentLang === "ua" ? "pl" : "ua");
});

// ----------------------------
// QR-код для презентації
// ----------------------------
function initQRCode() {
  const qrEl = document.getElementById("qr-code");
  const urlEl = document.getElementById("qr-url-text");
  if (!qrEl) return;

  const url = window.location.href.split("?")[0].split("#")[0];
  if (urlEl) urlEl.textContent = url;

  // Очищаємо попередній QR якщо є
  qrEl.innerHTML = "";

  if (typeof QRCode !== "undefined") {
    new QRCode(qrEl, {
      text: url,
      width:  140,
      height: 140,
      colorDark:  "#0057cc",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {

  if (doctorField)   doctorField.hidden   = true;
  if (medicineField) medicineField.hidden = true;

  populateDoctors(DOCTORS);
  populateMedicines(MEDICINES);

  // Відновлюємо мову
  applyTranslation(currentLang);

  // Ініціалізуємо QR-код
  initQRCode();

  doctorSearch?.addEventListener("focus", () => {
    if (doctorSearch.value) {
      populateDoctors(bestDoctorMatches(doctorSearch.value));
      autoselectFirstOption(doctorList);
    }
  });
  medicineSearch?.addEventListener("focus", () => {
    if (medicineSearch.value) {
      populateMedicines(bestMedicineMatches(medicineSearch.value));
      autoselectFirstOption(medicineList);
    }
  });

  // Реєстрація Service Worker
  if ("serviceWorker" in navigator && firebaseReady) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(reg => console.log("Service Worker registered:", reg.scope))
      .catch(err => console.warn("Service Worker registration failed:", err));
  }

  // Відновлення сесії при перезавантаженні
  if (firebaseReady && authApi) {
    authApi.onAuthStateChanged(async user => {
      if (user) {
        setUiAuthState(true);
        await loadRemindersFromFirestore(user.uid);
        await scheduleAllReminders(user);
        hideVerifyBanner();
      } else {
        setUiAuthState(false);
        clearAllReminderTimers();
      }
    });
  }
});
