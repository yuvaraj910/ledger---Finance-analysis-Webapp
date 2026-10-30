(() => {
  const STORAGE_KEY = "ledger-local-v1";
  const CATEGORY_COLORS = {
    "Essentials": "#ff7d38",
    "Food & groceries": "#39c98a",
    "Transport": "#5797fa",
    "Lifestyle": "#a873ee",
    "Subscriptions": "#ec6fbc",
    "Other": "#f5bf45",
    "Savings": "#39c6c5",
    "Income": "#39c98a"
  };
  const STARTER_TRANSACTIONS = [
    { description: "College canteen", type: "expense", amount: 240, category: "Food & groceries", date: "2026-10-02", payment: "UPI" },
    { description: "Local train pass", type: "expense", amount: 350, category: "Transport", date: "2026-10-03", payment: "UPI" },
    { description: "Mobile recharge", type: "expense", amount: 299, category: "Essentials", date: "2026-10-04", payment: "UPI" },
    { description: "Groceries — weekly", type: "expense", amount: 1480, category: "Food & groceries", date: "2026-10-05", payment: "UPI" },
    { description: "Chicken & protein", type: "expense", amount: 620, category: "Essentials", date: "2026-10-06", payment: "UPI" },
    { description: "Internet bill", type: "expense", amount: 799, category: "Essentials", date: "2026-10-08", payment: "Auto-pay" },
    { description: "Gym membership", type: "expense", amount: 700, category: "Essentials", date: "2026-10-09", payment: "UPI" },
    { description: "Miscellaneous", type: "expense", amount: 890, category: "Lifestyle", date: "2026-10-14", payment: "UPI" },
    { description: "Emergency savings", type: "transfer", amount: 2000, category: "Savings", date: "2026-10-16", payment: "Transfer" },
    { description: "Home essentials & supplies", type: "expense", amount: 4402, category: "Essentials", date: "2026-10-17", payment: "UPI" },
    { description: "Grocery top-up", type: "expense", amount: 2120, category: "Food & groceries", date: "2026-10-18", payment: "UPI" },
    { description: "Transit top-up", type: "expense", amount: 1810, category: "Transport", date: "2026-10-19", payment: "UPI" },
    { description: "Weekend plans", type: "expense", amount: 2210, category: "Lifestyle", date: "2026-10-20", payment: "UPI" },
    { description: "Streaming services", type: "expense", amount: 1250, category: "Subscriptions", date: "2026-10-20", payment: "Auto-pay" },
    { description: "Gifts & other", type: "expense", amount: 1250, category: "Other", date: "2026-10-21", payment: "UPI" }
  ];
  const STARTER_GOALS = [
    { name: "Emergency fund", target: 30000, saved: 12000, priority: "Medium", color: "#39c6c5" },
    { name: "New smartphone", target: 55000, saved: 8500, priority: "Low", color: "#a873ee" },
    { name: "College fees", target: 28800, saved: 18000, priority: "High", color: "#ff7d38" }
  ];
  const STARTER_LOANS = [
    { name: "True Balance Loan", amount: 1000, interest: 114, note: "" },
    { name: "10k Loan", amount: 10000, interest: 0, note: "Pay ASAP" }
  ];
  const STARTER_TRIPS = [
    { name: "Nepal trip", minBudget: 8000, maxBudget: 10000, target: 10000 }
  ];
  const WISHLIST_UPDATE_ITEMS = [
    { group: "Necessity", name: "Surge protector", minAmount: 800, maxAmount: 1500 },
    { group: "Necessity", name: "PC cleaning supplies", minAmount: 200, maxAmount: 500 },
    { group: "Priority", name: "RAM stick", amount: 12500 },
    { group: "Priority", name: "Mousepad", minAmount: 300, maxAmount: 800 },
    { group: "Priority", name: "UPS", minAmount: 3000, maxAmount: 6000, note: "Only if needed after checking your power supply situation" },
    { group: "Trivial", name: "USB hub", minAmount: 500, maxAmount: 1000 },
    { group: "Trivial", name: "Desk cable-management accessories", minAmount: 200, maxAmount: 500 },
    { group: "Trivial", name: "microSD card", amount: null }
  ];
  const STARTER_PLANNED_ITEMS = [
    { group: "Necessity", name: "Motherboard", amount: 6000 },
    { group: "Necessity", name: "Mechanical keyboard", amount: 1800 },
    { group: "Priority", name: "Monitor upgrade — AOC 24G4", amount: 9500 },
    { group: "Priority", name: "Monitor arm", amount: 2500 },
    { group: "Priority", name: "Graphics card", amount: 20000 },
    { group: "Priority", name: "PC case upgrade", amount: 3500 },
    { group: "Priority", name: "Wireless mouse", amount: 1000 },
    { group: "Trivial", name: "Headphones", amount: 3000 },
    { group: "Trivial", name: "Gaming controller", amount: 4000 },
    { group: "Trivial", name: "ESP32", amount: null },
    { group: "Trivial", name: "TFT display", amount: null },
    { group: "Trivial", name: "Rotary encoder / knob", amount: null },
    { group: "Trivial", name: "Physical buttons", amount: null },
    { group: "Trivial", name: "Battery and charging module", amount: null },
    { group: "Trivial", name: "Enclosure and wiring", amount: null },
    ...WISHLIST_UPDATE_ITEMS
  ];
  const STARTER_BUDGETS = {
    "Essentials": 8000,
    "Food & groceries": 5000,
    "Transport": 3000,
    "Lifestyle": 4000,
    "Subscriptions": 1500,
    "Other": 3500
  };
  const deepCopy = (value) => JSON.parse(JSON.stringify(value));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const initialMonth = "2026-10";
  let state = loadState();
  let filters = { query: "", type: "all", category: "all", date: "this-month", payment: "all", page: 1 };
  let toastTimer = null;

  const pageRoot = document.getElementById("page-root");
  const modalRoot = document.getElementById("modal-root");
  const toastRoot = document.getElementById("toast-root");
  saveState();

  function freshState() {
    const defaultJob = { id: uid(), name: "Blinkit", dailyRate: 0, overtimeRate: 0 };
    return {
      transactions: STARTER_TRANSACTIONS.map((tx) => ({ ...tx, id: uid() })),
      budgets: deepCopy(STARTER_BUDGETS),
      monthlyLimit: 25000,
      goals: STARTER_GOALS.map((goal) => ({ ...goal, id: uid() })),
      loans: STARTER_LOANS.map((loan) => ({ ...loan, id: uid() })),
      trips: STARTER_TRIPS.map((trip) => ({ ...trip, id: uid() })),
      completedTrips: [],
      travelFund: 0,
      jobs: [defaultJob],
      activeJobId: defaultJob.id,
      salaryRecords: [],
      plannedItems: STARTER_PLANNED_ITEMS.map((item) => ({ ...item, id: uid(), checked: false })),
      wishlistVersion: 2,
      currency: "INR",
      currentMonth: initialMonth,
      openingBalance: 0,
      isSample: true
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.transactions)) return freshState();
      const defaults = freshState();
      const isSample = parsed.isSample !== false;
      const transactions = parsed.transactions.map((tx) => ({
        ...tx,
        id: tx.id || uid(),
        type: ["income", "expense", "transfer"].includes(tx.type) ? tx.type : "expense",
        amount: Math.abs(Number(tx.amount) || 0)
      }));
      const loans = (Array.isArray(parsed.loans) ? parsed.loans : deepCopy(STARTER_LOANS)).map((loan) => ({
        ...loan,
        id: loan.id || uid(),
        name: String(loan.name || ""),
        amount: Math.max(0, Number(loan.amount) || 0),
        interest: Math.max(0, Number(loan.interest) || 0),
        note: String(loan.note || "")
      }));
      const trueBalanceLoan = loans.find((loan) => loan.name.trim().toLowerCase() === "true balance loan");
      if (trueBalanceLoan) Object.assign(trueBalanceLoan, { amount: 1000, interest: 114 });
      else loans.push({ ...STARTER_LOANS[0], id: uid() });
      const urgentLoan = loans.find((loan) => loan.name.trim().toLowerCase() === "10k loan");
      if (urgentLoan) Object.assign(urgentLoan, { amount: 10000, interest: 0, note: "Pay ASAP" });
      else loans.push({ ...STARTER_LOANS[1], id: uid() });
      const plannedItems = migratePlannedItems(parsed.plannedItems, parsed.wishlistVersion);
      const trips = normalizeTrips(Array.isArray(parsed.trips) ? parsed.trips : STARTER_TRIPS.map((trip) => ({ ...trip, id: uid() })));
      const completedTrips = normalizeCompletedTrips(Array.isArray(parsed.completedTrips) ? parsed.completedTrips : []);
      const jobs = normalizeJobs(Array.isArray(parsed.jobs) ? parsed.jobs : defaults.jobs);
      const salaryRecords = normalizeSalaryRecords(Array.isArray(parsed.salaryRecords) ? parsed.salaryRecords : [], jobs);
      return {
        ...defaults,
        ...parsed,
        transactions,
        budgets: { ...STARTER_BUDGETS, ...(parsed.budgets || {}) },
        goals: Array.isArray(parsed.goals) ? parsed.goals : deepCopy(STARTER_GOALS).map((goal) => ({ ...goal, id: uid() })),
        loans,
        trips,
        completedTrips,
        jobs,
        activeJobId: jobs.some((job) => job.id === parsed.activeJobId) ? parsed.activeJobId : (jobs[0]?.id || ""),
        salaryRecords,
        travelFund: Math.max(0, Number(parsed.travelFund) || 0),
        plannedItems,
        wishlistVersion: 2,
        currency: ["INR", "USD", "EUR", "GBP", "CAD", "AUD"].includes(parsed.currency) ? parsed.currency : "INR",
        currentMonth: isValidYearMonth(parsed.currentMonth) ? parsed.currentMonth : initialMonth,
        monthlyLimit: parsed.monthlyLimit === 0 ? 0 : Math.max(0, Number(parsed.monthlyLimit) || 25000),
        isSample
      };
    } catch {
      return freshState();
    }
  }

  function normalizePlannedItems(items) {
    const groups = ["Necessity", "Priority", "Trivial"];
    return items.filter((item) => item && typeof item === "object" && String(item.name || "").trim()).map((item) => ({
      ...item,
      id: item.id || uid(),
      group: groups.includes(item.group) ? item.group : "Trivial",
      name: String(item.name).trim(),
      amount: item.amount === null || item.amount === "" || item.amount === undefined ? null : Math.max(0, Number(item.amount) || 0),
      minAmount: item.minAmount === null || item.minAmount === "" || item.minAmount === undefined ? null : Math.max(0, Number(item.minAmount) || 0),
      maxAmount: item.maxAmount === null || item.maxAmount === "" || item.maxAmount === undefined ? null : Math.max(0, Number(item.maxAmount) || 0),
      note: String(item.note || ""),
      checked: item.checked === true
    }));
  }

  function normalizeTrips(trips) {
    return trips.filter((trip) => trip && typeof trip === "object" && String(trip.name || "").trim()).map((trip) => {
      const minBudget = Math.max(0, Number(trip.minBudget) || 0);
      const maxBudget = Math.max(minBudget, Number(trip.maxBudget) || 0);
      return {
        ...trip,
        id: trip.id || uid(),
        name: String(trip.name).trim(),
        minBudget,
        maxBudget,
        target: Math.max(0, Number(trip.target) || maxBudget),
        note: String(trip.note || "")
      };
    });
  }

  function normalizeCompletedTrips(trips) {
    return normalizeTrips(trips).map((trip) => ({
      ...trip,
      completedAt: isValidISODate(trip.completedAt) ? trip.completedAt : "",
      actualCost: Math.max(0, Number(trip.actualCost) || 0)
    }));
  }

  function normalizeJobs(jobs) {
    return jobs.filter((job) => job && typeof job === "object" && String(job.name || "").trim()).map((job) => ({
      ...job,
      id: job.id || uid(),
      name: String(job.name).trim(),
      dailyRate: Math.max(0, Number(job.dailyRate) || 0),
      overtimeRate: Math.max(0, Number(job.overtimeRate) || 0)
    }));
  }

  function normalizeSalaryRecords(records, jobs = []) {
    return records.filter((record) => record && typeof record === "object" && isValidYearMonth(record.month))
      .map((record) => {
        const jobId = String(record.jobId || jobs[0]?.id || "");
        const workingDays = Math.max(0, Number(record.workingDays) || 0);
        const dailyRate = Math.max(0, Number(record.dailyRate) || 0);
        const overtimeHours = Math.max(0, Number(record.overtimeHours) || 0);
        const overtimeRate = Math.max(0, Number(record.overtimeRate) || 0);
        const otherEarnings = Math.max(0, Number(record.otherEarnings) || 0);
        const deductions = Math.max(0, Number(record.deductions) || 0);
        const basePayout = workingDays * dailyRate;
        const overtimePayout = overtimeHours * overtimeRate;
        return {
          ...record,
          id: record.id || uid(),
          jobId,
          jobName: String(record.jobName || jobs.find((job) => job.id === jobId)?.name || "Job"),
          month: record.month,
          paidOn: isValidISODate(record.paidOn) ? record.paidOn : `${record.month}-01`,
          workingDays,
          dailyRate,
          basePayout,
          overtimeHours,
          overtimeRate,
          overtimePayout,
          otherEarnings,
          deductions,
          totalSalary: Math.max(0, basePayout + overtimePayout + otherEarnings - deductions),
          transactionId: String(record.transactionId || "")
        };
      }).filter((record) => record.jobId);
  }

  function migratePlannedItems(items, version) {
    const hasSavedItems = Array.isArray(items);
    const planned = normalizePlannedItems(hasSavedItems ? items : STARTER_PLANNED_ITEMS.map((item) => ({ ...item, id: uid() })));
    if (hasSavedItems && Number(version || 0) < 2) {
      for (const update of WISHLIST_UPDATE_ITEMS) {
        if (!planned.some((item) => item.group === update.group && item.name.toLowerCase() === update.name.toLowerCase())) planned.push({ ...update, id: uid(), checked: false });
      }
    }
    return planned;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      showToast("Browser storage is full. Export a backup before adding more data.");
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  }

  function formatMoney(amount, compact = false) {
    const currency = state.currency || "INR";
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency", currency, maximumFractionDigits: 0,
        notation: compact && Math.abs(amount) >= 100000 ? "compact" : "standard"
      }).format(Number(amount) || 0);
    } catch {
      return `${currency} ${(Number(amount) || 0).toLocaleString("en-IN")}`;
    }
  }

  function currentPage() {
    const page = location.hash.replace(/^#\/?/, "");
    return ["overview", "transactions", "work", "budgets", "insights", "settings"].includes(page) ? page : "overview";
  }

  function monthLabel(month = state.currentMonth) {
    const [year, monthNum] = month.split("-").map(Number);
    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, monthNum - 1, 1));
  }

  function shortDate(value) {
    if (!value) return "—";
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(year, month - 1, day));
  }

  function todayISO() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  function isValidISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function isValidYearMonth(value) {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(value || "");
  }

  function monthTransactions(month = state.currentMonth) {
    return state.transactions.filter((tx) => (tx.date || "").slice(0, 7) === month);
  }

  function totals(transactions) {
    return transactions.reduce((acc, tx) => {
      const amount = Math.max(0, Number(tx.amount) || 0);
      if (tx.type === "income") acc.income += amount;
      else if (tx.type === "expense") acc.expense += amount;
      else if (tx.type === "transfer") acc.transfers += amount;
      return acc;
    }, { income: 0, expense: 0, transfers: 0 });
  }

  function monthStats(month) {
    const items = monthTransactions(month);
    return totals(items);
  }

  function previousMonth(month = state.currentMonth) {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function percentChange(current, previous) {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }

  function iconNav(page) {
    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.classList.toggle("active", button.dataset.nav === page);
      if (button.dataset.nav === page) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function header({ eyebrow = "", title, subtitle = "", actions = "" }) {
    return `<header class="page-header">
      <div><p class="eyebrow">${eyebrow ? escapeHTML(eyebrow) : "&nbsp;"}</p><h1>${escapeHTML(title)}</h1>${subtitle ? `<p class="subtitle">${escapeHTML(subtitle)}</p>` : ""}</div>
      <div class="header-actions">${actions}</div>
    </header>`;
  }

  function starterNotice() {
    return state.isSample ? `<div class="starter-notice"><span class="starter-tag">Sample data</span><span>These are editable examples, not your transactions. Clear them in Settings when you're ready to start fresh.</span><button class="text-button" data-nav="settings">Settings →</button></div>` : "";
  }

  function monthInput() {
    return `<label class="sr-only" for="month-control">Choose month</label><input id="month-control" class="month-control" type="month" value="${escapeHTML(state.currentMonth)}" aria-label="Choose month" />`;
  }

  function metricCard(label, value, trend, note, trendClass = "positive") {
    return `<section class="metric-card" aria-label="${escapeHTML(label)}">
      <div class="metric-label">${escapeHTML(label.toUpperCase())}</div>
      <div class="metric-value">${escapeHTML(value)}</div>
      <div class="metric-change ${trendClass}">${trend}</div>
      <div class="metric-note">${escapeHTML(note)}</div>
    </section>`;
  }

  function renderWishlistGroup(group) {
    const planned = state.plannedItems.filter((item) => item.group === group);
    const total = formatWishlistTotal(planned);
    const rows = planned.map((item) => `<div class="savings-goal loan-entry wishlist-entry ${item.checked ? "checked" : ""}">
      <span class="goal-icon wishlist-item-icon kind-${wishlistItemKind(item)}" aria-hidden="true">${wishlistItemIcon(item)}</span>
      <div class="goal-copy"><div class="goal-name">${escapeHTML(item.name)}</div><div class="goal-meta">${escapeHTML(formatWishlistPrice(item))}${item.note ? ` · ${escapeHTML(item.note)}` : ""}</div></div>
      <button class="icon-button" data-action="edit-planned-item" data-id="${escapeHTML(item.id)}" aria-label="Edit ${escapeHTML(item.name)}">↗</button>
      <label class="wishlist-check"><input type="checkbox" data-plan-item data-id="${escapeHTML(item.id)}" aria-label="Mark ${escapeHTML(item.name)} as purchased" ${item.checked ? "checked" : ""} /></label>
    </div>`).join("");
    return `<section class="card wishlist-card wishlist-${group.toLowerCase()}">
      <div class="card-heading"><div><h2 class="card-title">${group}</h2><p class="card-subtitle">${planned.length} wishlist item${planned.length === 1 ? "" : "s"}</p></div><button class="text-button" data-action="add-planned-item" data-group="${group}">＋ Add</button></div>
      <div class="wishlist-total-label">Wishlist total</div><div class="wishlist-total">${escapeHTML(total)}</div>
      <div class="loan-list wishlist-items">${rows || `<div class="empty-state">No items in this wishlist yet.</div>`}</div>
    </section>`;
  }

  function plannedPriceBounds(item) {
    if (item.amount !== null && item.amount !== undefined && item.amount !== "") {
      const amount = Math.max(0, Number(item.amount) || 0);
      return { min: amount, max: amount };
    }
    if (item.minAmount == null && item.maxAmount == null) return null;
    const min = item.minAmount == null ? Number(item.maxAmount) : Number(item.minAmount);
    const max = item.maxAmount == null ? Number(item.minAmount) : Number(item.maxAmount);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max };
  }

  function formatWishlistPrice(item) {
    const bounds = plannedPriceBounds(item);
    if (!bounds) return "Price TBD";
    return bounds.min === bounds.max ? formatMoney(bounds.min) : `${formatMoney(bounds.min)}–${formatMoney(bounds.max)}`;
  }

  function formatWishlistTotal(items) {
    const remaining = items.filter((item) => !item.checked).map(plannedPriceBounds).filter(Boolean);
    const min = remaining.reduce((sum, bounds) => sum + bounds.min, 0);
    const max = remaining.reduce((sum, bounds) => sum + bounds.max, 0);
    return min === max ? formatMoney(min) : `${formatMoney(min)}–${formatMoney(max)}`;
  }

  function wishlistItemKind(item) {
    const name = item.name.toLowerCase();
    if (name.includes("upgrade")) return "upgrade";
    if (["keyboard", "mouse", "headphones", "controller", "monitor arm", "surge protector", "cleaning supplies", "ups", "usb hub", "cable-management", "cable management"].some((part) => name.includes(part))) return "accessory";
    return "part";
  }

  function wishlistItemIcon(item) {
    const kind = wishlistItemKind(item);
    if (kind === "upgrade") return `<svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" /></svg>`;
    if (kind === "accessory") return `<svg viewBox="0 0 24 24"><path d="M6 13v-2a6 6 0 0 1 12 0v2M6 13H4v4h4v-4H6Zm12 0h2v4h-4v-4h2ZM8 19h8" /></svg>`;
    return `<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" /></svg>`;
  }

  function categoryTotals(transactions) {
    const result = {};
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      const category = tx.category || "Other";
      result[category] = (result[category] || 0) + Number(tx.amount || 0);
    }
    return result;
  }

  function renderCategoryBreakdown(categories, budgets = false) {
    const entries = Object.entries(categories).filter(([, amount]) => amount > 0).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return `<div class="empty-state">No spending recorded for ${escapeHTML(monthLabel())} yet.</div>`;
    const maxAmount = Math.max(...entries.map((entry) => entry[1]), 1);
    return entries.map(([name, amount]) => {
      const cap = Number(state.budgets[name] || amount || 1);
      const percentage = budgets ? (cap ? Math.min(100, amount / cap * 100) : 0) : (amount / maxAmount * 100);
      const color = CATEGORY_COLORS[name] || CATEGORY_COLORS.Other;
      return `<div class="${budgets ? "budget-category-row" : "category-row"}">
        <div class="category-row-top"><span class="category-name"><i class="category-dot" style="background:${color}"></i>${escapeHTML(name)}</span>
        <span class="category-amount">${escapeHTML(formatMoney(amount))}${budgets ? ` / ${escapeHTML(formatMoney(cap))}` : ""}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${percentage}%;background:${color}"></div></div>
      </div>`;
    }).join("");
  }

  function trendValues() {
    const d = new Date(Number(state.currentMonth.slice(0, 4)), Number(state.currentMonth.slice(5, 7)) - 1, 1);
    return [{ month: state.currentMonth, label: new Intl.DateTimeFormat("en", { month: "short" }).format(d), ...monthStats(state.currentMonth) }];
  }

  function renderCashFlowCard() {
    const data = trendValues();
    const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
    const hasActivity = monthTransactions(state.currentMonth).length > 0;
    const bars = data.map((d) => {
      const incomeHeight = Math.max(d.income ? 3 : 0, d.income / maxValue * 156);
      const expenseHeight = Math.max(d.expense ? 3 : 0, d.expense / maxValue * 156);
      return `<div class="chart-column" title="${escapeHTML(d.label)} · Income ${escapeHTML(formatMoney(d.income))} · Expenses ${escapeHTML(formatMoney(d.expense))}">
        <div class="bar-pair"><div class="bar income" style="height:${incomeHeight}px"></div><div class="bar expense" style="height:${expenseHeight}px"></div></div>
        <span class="chart-month">${escapeHTML(d.label)}</span></div>`;
    }).join("");
    return `<section class="card chart-card">
      <div class="card-heading"><div><h2 class="card-title">Cash flow</h2><p class="card-subtitle">Income vs expenses · ${escapeHTML(monthLabel())}</p></div>
      <div class="chart-legend"><span><i class="legend-dot" style="background:var(--green)"></i>Income</span><span><i class="legend-dot" style="background:var(--orange)"></i>Expenses</span></div></div>
      ${hasActivity ? `<div class="chart" role="img" aria-label="Bar chart comparing income and expenses for ${escapeHTML(monthLabel())}"><div class="chart-gridlines"><span></span><span></span><span></span><span></span></div>${bars}</div>` : `<div class="empty-state chart-empty-state">No income or expenses recorded for ${escapeHTML(monthLabel())} yet.</div>`}
    </section>`;
  }

  function priorityItems() {
    const saved = state.goals.map((goal) => ({ name: goal.name, amount: Number(goal.target) || 0, priority: goal.priority || "Medium", kind: "goal" }));
    const loans = state.loans.map((loan) => ({ name: loan.name, amount: Number(loan.amount) + Number(loan.interest), priority: "High", kind: "debt" }));
    const items = [...saved, ...loans];
    const rank = { High: 0, Medium: 1, Low: 2 };
    return items.sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1)).slice(0, 4);
  }

  function renderPriorityCard() {
    const colors = { High: "#ff666d", Medium: "#39c6c5", Low: "#b78aff" };
    const rows = priorityItems().map((item) => {
      const matching = state.goals.find((goal) => goal.name === item.name);
      const progress = matching ? Math.min(100, (Number(matching.saved) || 0) / (Number(matching.target) || 1) * 100) : 48;
      return `<div class="goal-row">
        <div><div class="goal-name">${escapeHTML(item.name)}</div><div class="goal-meta">${escapeHTML(item.kind === "debt" ? "Debt" : item.priority === "High" ? "Priority goal" : "Savings goal")}</div></div>
        <span>${escapeHTML(formatMoney(item.amount))}</span>
        <span class="priority-pill priority-${item.priority.toLowerCase()}">${escapeHTML(item.priority)}</span>
        <div class="goal-progress"><span style="width:${progress}%;background:${colors[item.priority] || colors.Medium}"></span></div>
      </div>`;
    }).join("");
    return `<section class="card bottom-card">
      <div class="card-heading"><div><h2 class="card-title">Priority expenses</h2><p class="card-subtitle">Keep the important things funded first.</p></div><button class="text-button" data-nav="budgets">Manage goals</button></div>
      <div class="goal-list">${rows || `<div class="empty-state">Add a goal to start planning.</div>`}</div>
    </section>`;
  }

  function renderMonthlyBudgetCard(monthTotals) {
    const pct = state.monthlyLimit > 0 ? Math.min(100, monthTotals.expense / state.monthlyLimit * 100) : 0;
    const remaining = Math.max(0, state.monthlyLimit - monthTotals.expense);
    const over = Math.max(0, monthTotals.expense - state.monthlyLimit);
    const previousExpense = monthStats(previousMonth()).expense;
    const hasPreviousExpenses = previousExpense > 0;
    const comparison = Math.abs(percentChange(monthTotals.expense, previousExpense));
    const lower = monthTotals.expense <= previousExpense;
    return `<section class="card bottom-card">
      <div class="card-heading"><div><h2 class="card-title">Monthly budget</h2><p class="card-subtitle">Your spending limit at a glance</p></div><button class="icon-button" title="Edit budget" aria-label="Edit budget" data-action="edit-budget">···</button></div>
      <div class="budget-large">${escapeHTML(formatMoney(monthTotals.expense))}</div>
      <div class="budget-caption">of ${escapeHTML(formatMoney(state.monthlyLimit))} used</div>
      <div class="progress-track" style="height:8px;margin-top:15px"><div class="progress-fill" style="width:${pct}%;background:var(--orange)"></div></div>
      <div class="budget-meta"><span class="orange-text">${pct.toFixed(1)}% used</span><span class="${over ? "negative" : "positive"}">${over ? `${escapeHTML(formatMoney(over))} over budget` : `${escapeHTML(formatMoney(remaining))} left to spend`}</span></div>
      <div class="budget-insight"><strong>${hasPreviousExpenses ? (lower ? "✦ &nbsp;A small win" : "↗ &nbsp;Spending trend") : "No prior-month comparison"}</strong><span>${hasPreviousExpenses ? (lower ? `You spent ${comparison.toFixed(1)}% less than last month.` : `Spending is up ${comparison.toFixed(1)}% from last month.`) : "Previous-month expenses will appear here when you record them."}</span><small>${monthTotals.income > monthTotals.expense ? `You have ${escapeHTML(formatMoney(monthTotals.income - monthTotals.expense))} left after tracked spending.` : "Consider reviewing your spending plan."}</small></div>
    </section>`;
  }

  function renderOverview() {
    const items = monthTransactions();
    const current = totals(items);
    const loanTotal = state.loans.reduce((sum, loan) => sum + Number(loan.amount || 0) + Number(loan.interest || 0), 0);
    const prev = monthStats(previousMonth());
    const net = current.income - current.expense;
    const balance = Number(state.openingBalance || 0) + current.income - current.expense - current.transfers;
    const incomeDelta = percentChange(current.income, prev.income);
    const expenseDelta = percentChange(current.expense, prev.expense);
    const hasPreviousIncome = prev.income > 0;
    const hasPreviousExpenses = prev.expense > 0;
    const savedRate = current.income ? (net / current.income * 100) : 0;
    const categoryData = categoryTotals(items);
    const incomeText = hasPreviousIncome ? `${incomeDelta >= 0 ? "↗" : "↘"} &nbsp;${Math.abs(incomeDelta).toFixed(1)}% vs prior month` : "No prior-month income recorded";
    const expenseText = hasPreviousExpenses ? `${expenseDelta <= 0 ? "↘" : "↗"} &nbsp;${Math.abs(expenseDelta).toFixed(1)}% vs prior month` : "No prior-month expenses recorded";
    const actions = `${monthInput()}<button class="btn btn-primary" data-action="add-transaction">＋ &nbsp;Add entry</button>`;
    pageRoot.innerHTML = `${header({ eyebrow: "Good evening 👋", title: "Your money, in focus.", subtitle: "A clear picture of your financial month.", actions })}${starterNotice()}
      <div class="metric-grid overview-metrics">
        ${metricCard("Total income", formatMoney(current.income), incomeText, "Money in this month", incomeDelta >= 0 ? "positive" : "negative")}
        ${metricCard("Total spent", formatMoney(current.expense), expenseText, `${current.income ? (current.expense / current.income * 100).toFixed(1) : 0}% of income`, expenseDelta <= 0 ? "positive" : "negative")}
        ${metricCard("Saved this month", formatMoney(Math.max(0, net)), `↗ &nbsp;${savedRate.toFixed(1)}% savings rate`, `${formatMoney(current.transfers)} moved to savings`, "positive")}
        ${metricCard("Available balance", formatMoney(balance), balance >= 0 ? "On track" : "Needs a look", "After tracked spending & transfers", balance >= 0 ? "purple-text" : "negative")}
        ${metricCard("Total loan", formatMoney(loanTotal), `${state.loans.length} active loan${state.loans.length === 1 ? "" : "s"}`, "Principal + interest", "negative")}
      </div>
      <div class="dashboard-grid">
        ${renderCashFlowCard()}
        <section class="card category-card"><div class="card-heading"><div><h2 class="card-title">Where it goes</h2><p class="card-subtitle">Spending by category</p></div><button class="text-button" data-nav="transactions">View all</button></div><div class="category-list">${renderCategoryBreakdown(categoryData)}</div></section>
        ${renderPriorityCard()}
        ${renderMonthlyBudgetCard(current)}
      </div>`;
    iconNav("overview");
  }

  function filteredTransactions() {
    let items = state.transactions.slice();
    if (filters.date === "this-month") items = items.filter((tx) => tx.date?.slice(0, 7) === state.currentMonth);
    if (filters.date === "last-30") {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      items = items.filter((tx) => new Date(`${tx.date}T12:00:00`) >= cutoff);
    }
    if (filters.type !== "all") items = items.filter((tx) => tx.type === filters.type);
    if (filters.category !== "all") items = items.filter((tx) => tx.category === filters.category);
    if (filters.payment !== "all") items = items.filter((tx) => tx.payment === filters.payment);
    const query = filters.query.trim().toLowerCase();
    if (query) items = items.filter((tx) => [tx.description, tx.category, tx.payment].some((v) => String(v || "").toLowerCase().includes(query)));
    return items.sort((a, b) => (a.date || "").localeCompare(b.date || "") || a.description.localeCompare(b.description));
  }

  function transactionRow(tx) {
    const typeStyle = tx.type === "income" ? "positive" : tx.type === "transfer" ? "cyan-text" : "negative";
    const prefix = tx.type === "income" ? "+" : "−";
    return `<tr>
      <td class="description-cell"><i class="category-dot" style="background:${CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other}"></i>${escapeHTML(tx.description)}</td>
      <td>${escapeHTML(tx.category)}</td><td>${escapeHTML(shortDate(tx.date))}</td><td>${escapeHTML(tx.payment)}</td>
      <td class="amount-cell ${typeStyle}">${prefix}${escapeHTML(formatMoney(tx.amount))}</td>
      <td>${tx.salaryRecordId ? `<span class="transaction-source-badge">Salary record</span>` : `<button class="icon-button" data-action="edit-transaction" data-id="${escapeHTML(tx.id)}" aria-label="Edit ${escapeHTML(tx.description)}">↗</button>`}</td>
    </tr>`;
  }

  function renderTransactionTable() {
    const wrap = document.getElementById("transaction-table-wrap");
    if (!wrap) return;
    const items = filteredTransactions();
    const pageSize = 11;
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    filters.page = Math.max(1, Math.min(filters.page, pageCount));
    const start = (filters.page - 1) * pageSize;
    const visible = items.slice(start, start + pageSize);
    const rows = visible.map(transactionRow).join("");
    const footerText = items.length ? `Showing ${start + 1}–${Math.min(start + pageSize, items.length)} of ${items.length} transactions` : "No transactions found";
    const pageButtons = [];
    if (pageCount > 1) {
      pageButtons.push(`<button class="page-button" data-action="page" data-page="${filters.page - 1}" ${filters.page === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>`);
      for (let i = 1; i <= pageCount; i++) pageButtons.push(`<button class="page-button ${i === filters.page ? "active" : ""}" data-action="page" data-page="${i}" aria-label="Page ${i}">${i}</button>`);
      pageButtons.push(`<button class="page-button" data-action="page" data-page="${filters.page + 1}" ${filters.page === pageCount ? "disabled" : ""} aria-label="Next page">›</button>`);
    }
    wrap.innerHTML = `<div class="table-heading"><div><h2>Recent activity</h2><p>${escapeHTML(monthLabel())}</p></div><button class="btn btn-quiet btn-small" data-action="export-csv">↓ &nbsp;Export CSV</button></div>
      <div class="table-scroll"><table class="transaction-table"><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>PAYMENT</th><th style="text-align:right">AMOUNT</th><th><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="6"><div class="empty-state">No transactions match these filters. Try adjusting your search or add a new entry.</div></td></tr>`}</tbody></table></div>
      <div class="table-footer"><span>${footerText}</span><div class="pagination">${pageButtons.join("")}</div></div>`;
  }

  function renderTransactions() {
    const monthItems = monthTransactions();
    const monthTotal = totals(monthItems);
    const previous = monthStats(previousMonth());
    const categories = [...new Set(state.transactions.map((tx) => tx.category).filter(Boolean))].sort();
    const payments = [...new Set(state.transactions.map((tx) => tx.payment).filter(Boolean))].sort();
    const categoryOptions = `<option value="all">Category</option>${categories.map((item) => `<option value="${escapeHTML(item)}" ${filters.category === item ? "selected" : ""}>${escapeHTML(item)}</option>`).join("")}`;
    const paymentOptions = `<option value="all">Payment</option>${payments.map((item) => `<option value="${escapeHTML(item)}" ${filters.payment === item ? "selected" : ""}>${escapeHTML(item)}</option>`).join("")}`;
    const actions = `<button class="btn btn-primary" data-action="add-transaction">＋ &nbsp;Add transaction</button>`;
    const incomeDelta = percentChange(monthTotal.income, previous.income);
    const expenseDelta = percentChange(monthTotal.expense, previous.expense);
    const hasPreviousIncome = previous.income > 0;
    const hasPreviousExpenses = previous.expense > 0;
    const filterButtons = `<div class="quick-filter-row"><button class="quick-filter ${filters.type === "all" ? "active" : ""}" data-type-filter="all">All</button><button class="quick-filter income-filter ${filters.type === "income" ? "active" : ""}" data-type-filter="income">Income</button><button class="quick-filter expense-filter ${filters.type === "expense" ? "active" : ""}" data-type-filter="expense">Expenses</button><button class="quick-filter ${filters.type === "transfer" ? "active" : ""}" data-type-filter="transfer">Transfers</button></div>`;
    pageRoot.innerHTML = `${header({ eyebrow: "Activity", title: "Transactions", subtitle: `${monthLabel()} · Every rupee, accounted for.`, actions })}${starterNotice()}
      <div class="metric-grid transaction-metrics">
        ${metricCard("Income", formatMoney(monthTotal.income), hasPreviousIncome ? `${incomeDelta >= 0 ? "+" : "−"}${Math.abs(incomeDelta).toFixed(1)}% vs prior month` : "No prior-month income recorded", "Money received", incomeDelta >= 0 ? "positive" : "negative")}
        ${metricCard("Expenses", formatMoney(monthTotal.expense), hasPreviousExpenses ? `${expenseDelta <= 0 ? "−" : "+"}${Math.abs(expenseDelta).toFixed(1)}% vs prior month` : "No prior-month expenses recorded", "Purchases and bills", expenseDelta <= 0 ? "positive" : "negative")}
        ${metricCard("Net cash flow", formatMoney(monthTotal.income - monthTotal.expense), "After income and expenses", `${formatMoney(monthTotal.transfers)} moved to savings`, "cyan-text")}
        <section class="metric-card quick-filter-card"><div class="metric-label">QUICK FILTERS</div>${filterButtons}</section>
      </div>
      <div class="filter-bar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="transaction-search" type="search" value="${escapeHTML(filters.query)}" placeholder="Search transactions, notes or categories…" aria-label="Search transactions" /></label>
        <select id="category-filter" class="control-select" aria-label="Filter by category">${categoryOptions}</select>
        <select id="date-filter" class="control-select" aria-label="Filter by date"><option value="this-month" ${filters.date === "this-month" ? "selected" : ""}>${escapeHTML(monthLabel())}</option><option value="last-30" ${filters.date === "last-30" ? "selected" : ""}>Last 30 days</option><option value="all" ${filters.date === "all" ? "selected" : ""}>All dates</option></select>
        <select id="payment-filter" class="control-select" aria-label="Filter by payment">${paymentOptions}</select>
      </div>
      <section class="card table-card" id="transaction-table-wrap"></section>`;
    iconNav("transactions");
    renderTransactionTable();
  }

  function renderBudgetOverview(monthTotal) {
    const remaining = state.monthlyLimit - monthTotal.expense;
    const pct = state.monthlyLimit ? Math.min(100, monthTotal.expense / state.monthlyLimit * 100) : 0;
    return `<section class="card budget-overview">
      <div class="budget-overview-main"><div class="budget-summary-title">${escapeHTML(monthLabel())} budget</div><div class="budget-summary-value">${escapeHTML(formatMoney(state.monthlyLimit))}</div><div class="budget-summary-sub">Monthly spending limit</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:var(--orange)"></div></div><div class="budget-meta"><span class="orange-text">${pct.toFixed(1)}% used</span><span class="${remaining < 0 ? "negative" : "positive"}">${remaining < 0 ? `${escapeHTML(formatMoney(-remaining))} over` : `${escapeHTML(formatMoney(remaining))} remaining`}</span></div></div>
      <div class="mini-stat"><div class="mini-stat-label">SPENT</div><div class="mini-stat-value">${escapeHTML(formatMoney(monthTotal.expense))}</div><div class="mini-stat-note ${remaining < 0 ? "negative" : "positive"}">${remaining < 0 ? "Over limit" : "Within your plan"}</div></div>
      <div class="mini-stat"><div class="mini-stat-label">AVAILABLE</div><div class="mini-stat-value">${escapeHTML(formatMoney(Math.max(0, remaining)))}</div><div class="mini-stat-note orange-text">${Math.max(0, 100 - pct).toFixed(1)}% left</div></div>
    </section>`;
  }

  function renderSavingsGoals() {
    if (!state.goals.length) return `<div class="empty-state">No savings goals yet. Add one to get started.</div>`;
    return `<div class="savings-goals">${state.goals.map((goal) => {
      const progress = Math.min(100, (Number(goal.saved) || 0) / Math.max(1, Number(goal.target) || 1) * 100);
      return `<div class="savings-goal"><div class="goal-icon" style="background:${escapeHTML(goal.color || "#39c6c5")}">${goal.name.toLowerCase().includes("phone") ? "✦" : goal.name.toLowerCase().includes("college") ? "▤" : "✚"}</div>
        <div class="goal-copy"><div class="goal-name">${escapeHTML(goal.name)}</div><div class="goal-meta">${escapeHTML(formatMoney(goal.saved))} of ${escapeHTML(formatMoney(goal.target))}</div></div>
        <div class="goal-progress"><span style="width:${progress}%;background:${escapeHTML(goal.color || "#39c6c5")}"></span></div>
        <button class="icon-button" data-action="edit-goal" data-id="${escapeHTML(goal.id)}" aria-label="Edit ${escapeHTML(goal.name)}">↗</button></div>`;
    }).join("")}</div>`;
  }

  function renderLoans() {
    if (!state.loans.length) return `<div class="empty-state">No loans recorded yet. Add one to track its amount and interest.</div>`;
    return `<div class="loan-list">${state.loans.map((loan) => `<div class="savings-goal loan-entry">
      <div class="goal-icon" style="background:#ff777a">₹</div>
      <div class="goal-copy"><div class="goal-name">${escapeHTML(loan.name)}</div><div class="goal-meta">Principal ${escapeHTML(formatMoney(loan.amount))} · Interest ${escapeHTML(formatMoney(loan.interest))} · Total ${escapeHTML(formatMoney(Number(loan.amount) + Number(loan.interest)))}${loan.note ? ` · ${escapeHTML(loan.note)}` : ""}</div></div>
      <button class="icon-button" data-action="edit-loan" data-id="${escapeHTML(loan.id)}" aria-label="Edit ${escapeHTML(loan.name)}">↗</button>
    </div>`).join("")}</div>`;
  }

  function renderTravelPlanning() {
    const target = state.trips.reduce((sum, trip) => sum + Number(trip.target || 0), 0);
    const progress = target > 0 ? Math.min(100, Number(state.travelFund || 0) / target * 100) : 0;
    const trips = state.trips.map((trip) => `<div class="travel-trip-row">
      <span class="travel-trip-icon" aria-hidden="true">✈</span>
      <div class="travel-trip-copy"><strong>${escapeHTML(trip.name)}</strong><span>Budget ${escapeHTML(formatMoney(trip.minBudget))}–${escapeHTML(formatMoney(trip.maxBudget))} · Target ${escapeHTML(formatMoney(trip.target))}${trip.note ? ` · ${escapeHTML(trip.note)}` : ""}</span></div>
      <div class="travel-trip-actions"><button class="btn btn-quiet btn-small" data-action="complete-trip" data-id="${escapeHTML(trip.id)}">Complete</button><button class="icon-button" data-action="edit-trip" data-id="${escapeHTML(trip.id)}" aria-label="Edit ${escapeHTML(trip.name)}">↗</button></div>
    </div>`).join("");
    const completed = state.completedTrips.slice().sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")).map((trip) => `<div class="travel-trip-row completed-trip-row">
      <span class="travel-trip-icon" aria-hidden="true">✓</span>
      <div class="travel-trip-copy"><strong>${escapeHTML(trip.name)}</strong><span>Completed ${escapeHTML(shortDate(trip.completedAt))} · Spent ${escapeHTML(formatMoney(trip.actualCost))}${trip.note ? ` · ${escapeHTML(trip.note)}` : ""}</span></div>
      <span class="completed-trip-label">Completed</span>
    </div>`).join("");
    return `<section class="card travel-card">
      <div class="card-heading"><div><h2 class="card-title">Travel fund</h2><p class="card-subtitle">Save toward your planned trips</p></div><button class="btn btn-secondary btn-small" data-action="add-travel-contribution">＋ Transfer money</button></div>
      <div class="travel-fund-summary"><div class="travel-fund-copy"><span>${target > 0 ? "Collected out of active trip targets" : "Available travel fund"}</span><div class="travel-fund-amount"><strong>${escapeHTML(formatMoney(state.travelFund || 0))}</strong>${target > 0 ? `<span>out of</span><strong>${escapeHTML(formatMoney(target))}</strong>` : ""}</div></div>
        <div class="travel-progress"><div class="progress-track"><div class="progress-fill" style="width:${progress}%;background:var(--cyan)"></div></div><span>${target > 0 ? `${progress.toFixed(0)}% funded` : "Add a trip to set a target"}</span></div>
      </div>
      <div class="travel-plans-heading"><div><h3>Travel plans</h3><p>${state.trips.length} planned trip${state.trips.length === 1 ? "" : "s"}</p></div><button class="text-button" data-action="add-trip">＋ Add trip</button></div>
      <div class="travel-trip-list">${trips || `<div class="empty-state">No trips planned yet. Add one to set a travel target.</div>`}</div>
      <div class="travel-history-heading"><div><h3>Completed trips</h3><p>${state.completedTrips.length} saved trip${state.completedTrips.length === 1 ? "" : "s"}</p></div></div>
      <div class="travel-trip-list completed-trip-list">${completed || `<div class="empty-state">Completed trips will be saved here.</div>`}</div>
      <div class="travel-ledger-note">Travel fund transfers are recorded in Transactions. <button class="text-button" data-nav="transactions">View transactions →</button></div>
    </section>`;
  }

  function activeJob() {
    return state.jobs.find((job) => job.id === state.activeJobId) || null;
  }

  function salaryRecordFor(jobId, month) {
    return state.salaryRecords.find((record) => record.jobId === jobId && record.month === month) || null;
  }

  function renderWork() {
    const job = activeJob();
    const record = job ? salaryRecordFor(job.id, state.currentMonth) : null;
    const jobRows = state.jobs.map((item) => {
      const active = item.id === state.activeJobId;
      const months = state.salaryRecords.filter((salary) => salary.jobId === item.id).length;
      return `<div class="job-profile-row ${active ? "active" : ""}">
        <div class="job-profile-copy"><div class="job-profile-title"><strong>${escapeHTML(item.name)}</strong>${active ? `<span class="job-current-badge">Current job</span>` : ""}</div>
          <span>${escapeHTML(formatMoney(item.dailyRate))} per workday · ${escapeHTML(formatMoney(item.overtimeRate))} per overtime hour · ${months} pay record${months === 1 ? "" : "s"}</span></div>
        <div class="job-profile-actions">${active ? "" : `<button class="btn btn-quiet btn-small" data-action="switch-job" data-id="${escapeHTML(item.id)}">Make current</button>`}<button class="icon-button" data-action="edit-job" data-id="${escapeHTML(item.id)}" aria-label="Edit ${escapeHTML(item.name)}">↗</button></div>
      </div>`;
    }).join("");
    const records = state.salaryRecords.slice().sort((a, b) => b.month.localeCompare(a.month) || a.jobName.localeCompare(b.jobName)).map((salary) => `<div class="salary-history-row">
      <div class="salary-history-copy"><strong>${escapeHTML(salary.jobName)}</strong><span>${escapeHTML(monthLabel(salary.month))} · Paid ${escapeHTML(shortDate(salary.paidOn))}</span>
        <small>${salary.workingDays} days × ${escapeHTML(formatMoney(salary.dailyRate))} = ${escapeHTML(formatMoney(salary.basePayout))} · ${salary.overtimeHours} overtime hours × ${escapeHTML(formatMoney(salary.overtimeRate))}/hour = ${escapeHTML(formatMoney(salary.overtimePayout))}${salary.otherEarnings ? ` · Other ${escapeHTML(formatMoney(salary.otherEarnings))}` : ""}${salary.deductions ? ` · Deductions ${escapeHTML(formatMoney(salary.deductions))}` : ""}</small></div>
      <div class="salary-history-total"><span>Salary</span><strong>${escapeHTML(formatMoney(salary.totalSalary))}</strong></div>
      <div class="salary-history-actions"><button class="icon-button" data-action="edit-salary" data-id="${escapeHTML(salary.id)}" aria-label="Edit ${escapeHTML(salary.jobName)} salary for ${escapeHTML(monthLabel(salary.month))}">↗</button><button class="icon-button" data-action="delete-salary" data-id="${escapeHTML(salary.id)}" aria-label="Delete ${escapeHTML(salary.jobName)} salary for ${escapeHTML(monthLabel(salary.month))}">×</button></div>
    </div>`).join("");
    const actions = `${monthInput()}<button class="btn btn-secondary" data-action="add-job">＋ &nbsp;Add job</button><button class="btn btn-primary" data-action="record-salary" ${job ? "" : "disabled"}>＋ &nbsp;${record ? "Edit salary record" : "Record salary"}</button>`;
    pageRoot.innerHTML = `${header({ eyebrow: "Work & earnings", title: "Salary this month", subtitle: job ? `Track pay from ${job.name}. Switch jobs anytime; older records stay saved.` : "Add a job profile to start tracking pay.", actions })}${starterNotice()}
      ${job ? `<div class="metric-grid salary-metrics">
        ${metricCard("Salary this month", formatMoney(record?.totalSalary || 0), record ? `${escapeHTML(monthLabel(state.currentMonth))} · ${escapeHTML(job.name)}` : "No salary record yet", record ? "Net pay after adjustments" : "Record a month to see earnings", "positive")}
        ${metricCard("Days worked", record ? String(record.workingDays) : "0", "Paid workdays", record ? `${escapeHTML(formatMoney(record.dailyRate))} per day` : "Daily rate set in salary record", "cyan-text")}
        ${metricCard("Regular payout", formatMoney(record?.basePayout || 0), "Workdays × daily rate", record ? `${record.workingDays} days · ${escapeHTML(formatMoney(record.dailyRate))}/day` : "Base earnings before overtime", "purple-text")}
        ${metricCard("Overtime payout", formatMoney(record?.overtimePayout || 0), record ? `${record.overtimeHours} hours worked` : "No overtime recorded", record ? `${escapeHTML(formatMoney(record.overtimeRate))} per overtime hour` : "Overtime hours × hourly rate", "orange-text")}
      </div>` : `<section class="card work-empty-prompt"><h2>No job profiles yet</h2><p>Add your current job to start recording monthly workdays, daily pay and overtime.</p><button class="btn btn-primary" data-action="add-job">＋ &nbsp;Add your current job</button></section>`}
      <div class="work-section-grid">
        <section class="card job-profiles-card"><div class="card-heading"><div><h2 class="card-title">Job profiles</h2><p class="card-subtitle">Your current and previous jobs</p></div><button class="text-button" data-action="add-job">＋ Add job</button></div>
          <div class="job-profile-list">${jobRows || `<div class="empty-state">Add a job profile. You can switch to another one whenever your work changes.</div>`}</div>
        </section>
        <section class="card salary-how-card"><div class="card-heading"><div><h2 class="card-title">Monthly pay calculation</h2><p class="card-subtitle">Rates are saved with each month’s record</p></div></div>
          <div class="salary-formula-row"><span>Regular pay</span><strong>Days worked × daily rate</strong></div>
          <div class="salary-formula-row"><span>Overtime pay</span><strong>Overtime hours × hourly rate</strong></div>
          <div class="salary-formula-row"><span>Salary total</span><strong>Regular + overtime + extras − deductions</strong></div>
          <p class="form-hint">Saving a salary record also adds its total as an income transaction. Edit or remove the record here to keep the transaction in sync.</p>
        </section>
      </div>
      <section class="card salary-history-card"><div class="card-heading"><div><h2 class="card-title">Salary history</h2><p class="card-subtitle">${state.salaryRecords.length} saved record${state.salaryRecords.length === 1 ? "" : "s"} across all jobs</p></div></div>
        <div class="salary-history-list">${records || `<div class="empty-state">Your saved monthly salary records will appear here.</div>`}</div>
      </section>`;
    iconNav("work");
  }

  function renderInsightsCards(monthTotal) {
    const prior = monthStats(previousMonth());
    const spend = percentChange(monthTotal.expense, prior.expense);
    const hasPriorExpenses = prior.expense > 0;
    const currentSavings = monthTotal.income ? monthTotal.income - monthTotal.expense : 0;
    const priorSavings = prior.income - prior.expense;
    const savingsRate = monthTotal.income ? currentSavings / monthTotal.income * 100 : 0;
    const priorRate = prior.income ? priorSavings / prior.income * 100 : 0;
    const hasPriorIncome = prior.income > 0;
    const categoryData = categoryTotals(monthTransactions());
    const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];
    const cards = [
      { label: "Total spending", value: hasPriorExpenses ? `${spend <= 0 ? "−" : "+"}${Math.abs(spend).toFixed(1)}%` : "—", note: hasPriorExpenses ? (spend <= 0 ? "Less spent" : "More spent") : "No prior-month expenses", color: spend <= 0 ? "var(--green)" : "var(--orange)" },
      { label: "Savings rate", value: hasPriorIncome ? `${savingsRate - priorRate >= 0 ? "+" : ""}${(savingsRate - priorRate).toFixed(1)} pts` : "—", note: hasPriorIncome ? "vs prior month" : "No prior-month income", color: "var(--cyan)" },
      { label: topCategory ? topCategory[0] : "Top category", value: topCategory ? formatMoney(topCategory[1]) : formatMoney(0), note: "Highest spend", color: "var(--yellow)" },
      { label: "Unplanned expenses", value: "Track as you go", note: "Add notes to entries", color: "var(--purple)" }
    ];
    return cards.map((card) => `<div class="insight-mini"><div><div class="insight-mini-label">${escapeHTML(card.label)}</div><div class="insight-mini-value" style="color:${card.color}">${escapeHTML(card.value)}</div></div><span class="insight-mini-note">${escapeHTML(card.note)}</span></div>`).join("");
  }

  function renderBudgets() {
    const items = monthTransactions();
    const monthTotal = totals(items);
    const actions = `${monthInput()}<button class="btn btn-secondary" data-action="add-goal">＋ &nbsp;Add goal</button><button class="btn btn-primary" data-action="edit-budget">＋ &nbsp;New budget</button>`;
    const categorySpend = categoryTotals(items);
    const allCategories = [...new Set([...Object.keys(state.budgets), ...Object.keys(categorySpend)])];
    const categoryHtml = allCategories.map((name) => {
      const amount = categorySpend[name] || 0;
      const limit = Number(state.budgets[name]) || 0;
      const pct = limit ? Math.min(100, amount / limit * 100) : amount ? 100 : 0;
      const color = CATEGORY_COLORS[name] || CATEGORY_COLORS.Other;
      return `<div class="budget-category-row"><div class="category-row-top"><span class="category-name"><i class="category-dot" style="background:${color}"></i>${escapeHTML(name)}</span><span class="category-amount">${escapeHTML(formatMoney(amount))} / ${escapeHTML(formatMoney(limit))}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div></div>`;
    }).join("");
    const insights = renderInsightsCards(monthTotal);
    const priorityRows = priorityItems().map((item, index) => `<div class="priority-item"><span class="priority-number" style="background:${index === 0 ? "#351b1d" : index === 1 ? "#30231a" : "#19302e"};color:${index === 0 ? "#ff777a" : index === 1 ? "#ffab62" : "var(--cyan)"}">${index + 1}</span><span class="priority-item-name">${escapeHTML(item.name)}</span><span class="priority-item-note" style="color:${item.priority === "High" ? "#ff777a" : item.priority === "Low" ? "#bd8dff" : "var(--cyan)"}">${escapeHTML(item.priority === "High" ? "High priority" : item.priority === "Low" ? "Flexible goal" : "Build steadily")}</span></div>`).join("");
    pageRoot.innerHTML = `${header({ eyebrow: "Plan with intention", title: "Budgets & insights", subtitle: "Know what needs funding — and what can wait.", actions })}${starterNotice()}
      ${renderBudgetOverview(monthTotal)}
      <div class="budget-grid">
        <section class="card budget-categories"><div class="card-heading"><div><h2 class="card-title">Category budgets</h2><p class="card-subtitle">Actual spending compared with your limits</p></div><button class="text-button" data-action="edit-budget">Edit limits</button></div>${categoryHtml || `<div class="empty-state">Set limits for your spending categories.</div>`}</section>
        <section class="card budget-categories"><div class="card-heading"><div><h2 class="card-title">Savings goals</h2><p class="card-subtitle">Build toward what matters</p></div><button class="text-button" data-action="add-goal">＋ Add</button></div>${renderSavingsGoals()}</section>
      </div>
      <div class="finance-sections-grid">
        <section class="card loan-card"><div class="card-heading"><div><h2 class="card-title">Loans</h2><p class="card-subtitle">Principal and interest</p></div><button class="text-button" data-action="add-loan">＋ Add</button></div>${renderLoans()}</section>
        ${renderWishlistGroup("Necessity")}
        ${renderWishlistGroup("Priority")}
        ${renderWishlistGroup("Trivial")}
      </div>
      ${renderTravelPlanning()}
      <div class="insight-grid">
        <section class="card"><div class="card-heading"><div><h2 class="card-title">Month-over-month insights</h2><p class="card-subtitle">How ${escapeHTML(monthLabel())} compares with the prior month</p></div></div><div class="insight-cards">${insights}</div></section>
        <section class="card"><div class="card-heading"><div><h2 class="card-title">Priority queue</h2><p class="card-subtitle">Suggested order for your next rupee</p></div></div><div class="priority-queue">${priorityRows}</div></section>
      </div>`;
    iconNav("budgets");
  }

  function renderInsights() {
    const monthTotal = totals(monthTransactions());
    const categories = categoryTotals(monthTransactions());
    const incomeShare = monthTotal.income ? Math.min(100, monthTotal.expense / monthTotal.income * 100) : 0;
    const actions = `${monthInput()}<button class="btn btn-secondary" data-action="export-csv">↓ &nbsp;Export CSV</button>`;
    const categoryContent = renderCategoryBreakdown(categories);
    pageRoot.innerHTML = `${header({ eyebrow: "Your patterns", title: "Insights", subtitle: `A closer look at ${monthLabel()} and your spending habits.`, actions })}${starterNotice()}
      <div class="metric-grid">
        ${metricCard("Income", formatMoney(monthTotal.income), `${monthTransactions().filter((tx) => tx.type === "income").length} income entries`, "For this month", "positive")}
        ${metricCard("Expenses", formatMoney(monthTotal.expense), `${incomeShare.toFixed(1)}% of income`, "For this month", "orange-text")}
        ${metricCard("Net cash flow", formatMoney(monthTotal.income - monthTotal.expense), monthTotal.income >= monthTotal.expense ? "Income is ahead of spending" : "Spending is ahead of income", "Transfers shown separately", monthTotal.income >= monthTotal.expense ? "cyan-text" : "negative")}
        ${metricCard("Budget remaining", formatMoney(Math.max(0, state.monthlyLimit - monthTotal.expense)), `${Math.min(100, monthTotal.expense / Math.max(1, state.monthlyLimit) * 100).toFixed(1)}% of monthly limit used`, "Adjust limits in Budgets", "purple-text")}
      </div>
      <div class="dashboard-grid"><section class="card chart-card">${renderCashFlowCard().replace(/^<section class="card chart-card">|<\/section>$/g, "")}</section>
      <section class="card category-card"><div class="card-heading"><div><h2 class="card-title">Spending by category</h2><p class="card-subtitle">Where your money went</p></div></div><div class="category-list">${categoryContent}</div></section>
      <section class="card"><div class="card-heading"><div><h2 class="card-title">Monthly overview</h2><p class="card-subtitle">${escapeHTML(monthLabel())}</p></div></div><div class="insight-cards">${renderInsightsCards(monthTotal)}</div></section>
      <section class="card"><div class="card-heading"><div><h2 class="card-title">A steady plan</h2><p class="card-subtitle">A few useful signals from your entries</p></div></div><div class="budget-insight"><strong>${monthTotal.expense <= state.monthlyLimit ? "✦ &nbsp;Within your monthly limit" : "↗ &nbsp;Above your monthly limit"}</strong><span>${monthTotal.expense <= state.monthlyLimit ? `${escapeHTML(formatMoney(state.monthlyLimit - monthTotal.expense))} remains in your plan.` : `${escapeHTML(formatMoney(monthTotal.expense - state.monthlyLimit))} above your plan.`}</span><small>Insights are calculated from transactions saved in this browser.</small></div><button class="text-button" style="margin-top:14px" data-nav="transactions">Review transactions →</button></section></div>`;
    iconNav("insights");
  }

  function renderSettings() {
    const amount = formatMoney(state.transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0));
    pageRoot.innerHTML = `${header({ eyebrow: "Your workspace", title: "Settings", subtitle: "Manage your preferences and local data." })}
      <div class="settings-grid">
        <section class="card settings-card"><div class="card-heading"><div><h2 class="card-title">Preferences</h2><p class="card-subtitle">Choose how amounts appear.</p></div></div>
          <div class="settings-row"><div class="settings-copy"><strong>Currency</strong><span>Used for values across your ledger.</span></div><select id="currency-setting" class="control-select settings-select" aria-label="Currency"><option value="INR" ${state.currency === "INR" ? "selected" : ""}>INR · ₹</option><option value="USD" ${state.currency === "USD" ? "selected" : ""}>USD · $</option><option value="EUR" ${state.currency === "EUR" ? "selected" : ""}>EUR · €</option><option value="GBP" ${state.currency === "GBP" ? "selected" : ""}>GBP · £</option><option value="CAD" ${state.currency === "CAD" ? "selected" : ""}>CAD · $</option><option value="AUD" ${state.currency === "AUD" ? "selected" : ""}>AUD · $</option></select></div>
          <div class="settings-row"><div class="settings-copy"><strong>Starting balance</strong><span>Optional balance before the transactions you track here.</span></div><button class="btn btn-secondary btn-small" data-action="edit-opening">${escapeHTML(formatMoney(state.openingBalance || 0))} &nbsp;Edit</button></div>
        </section>
        <section class="card settings-card"><div class="card-heading"><div><h2 class="card-title">Your data</h2><p class="card-subtitle">${state.transactions.length} entries · ${escapeHTML(amount)} across all tracked activity</p></div></div>
          <div class="settings-row"><div class="settings-copy"><strong>Export backup</strong><span>Download transactions, budgets, goals, loans, wishlists, travel plans, completed trips, job profiles, salary records and preferences as JSON.</span></div><button class="btn btn-secondary btn-small" data-action="export-backup">↓ &nbsp;Export</button></div>
          <div class="settings-row"><div class="settings-copy"><strong>Import backup</strong><span>Restore a Ledger JSON backup from this device.</span></div><button class="btn btn-secondary btn-small" data-action="import-backup">↑ &nbsp;Import</button></div>
          <div class="settings-row"><div class="settings-copy"><strong>Import transactions</strong><span>Add rows from a CSV with date, description, type, category, payment and amount columns. Clear the example data first if you want a blank ledger.</span></div><button class="btn btn-secondary btn-small" data-action="import-csv">↑ &nbsp;Import CSV</button></div>
          ${state.isSample ? `<div class="settings-row"><div class="settings-copy"><strong>Clear local data</strong><span>Remove all transactions, goals, loans, wishlist items, travel plans, completed trips, job profiles, salary records and budget limits saved in this browser so you can start with a blank ledger.</span></div><button class="btn btn-danger btn-small" data-action="clear-starter-data">Start fresh</button></div>` : ""}
          <div class="settings-row"><div class="settings-copy"><strong>Restore starter data</strong><span>Replace your current data with the editable Ledger example.</span></div><button class="btn btn-quiet btn-small" data-action="restore-starter">Restore</button></div>
          <input class="sr-only" id="backup-file" type="file" accept="application/json,.json" /><input class="sr-only" id="csv-file" type="file" accept="text/csv,.csv" />
        </section>
      </div>
      <div class="privacy-note"><span aria-hidden="true">◈</span><span><strong>Private by design.</strong> This Ledger runs in your browser. Your transactions, budgets, goals, loans, wishlist items, travel plans, completed trips, job profiles and salary records are stored in this browser's local storage; the site does not send them to a server. Use Export backup if you want a copy on another device.</span></div>`;
    iconNav("settings");
  }

  function render() {
    const page = currentPage();
    if (page === "transactions") renderTransactions();
    else if (page === "work") renderWork();
    else if (page === "budgets") renderBudgets();
    else if (page === "insights") renderInsights();
    else if (page === "settings") renderSettings();
    else renderOverview();
  }

  function showToast(message, undo = null) {
    clearTimeout(toastTimer);
    const id = uid();
    toastRoot.innerHTML = `<div class="toast success" data-toast="${id}"><span>${escapeHTML(message)}</span>${undo ? `<button data-undo="${id}">Undo</button>` : ""}</div>`;
    if (undo) toastRoot.querySelector(`[data-undo="${id}"]`).onclick = () => {
      undo(); saveState(); render(); toastRoot.innerHTML = "";
    };
    toastTimer = setTimeout(() => { toastRoot.innerHTML = ""; }, undo ? 7000 : 3600);
  }

  function closeModal() { modalRoot.innerHTML = ""; }

  function modalShell(title, subtitle, body, wide = false) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title">${escapeHTML(title)}</h2><p>${escapeHTML(subtitle || "")}</p></div><button class="icon-button" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body">${body}</div></section></div>`;
    modalRoot.querySelectorAll("form").forEach((form) => {
      const submit = form.querySelector('button[type="submit"]');
      if (submit) {
        submit.type = "button";
        submit.dataset.action = "submit-form";
      }
    });
    modalRoot.querySelector("input:not([type=hidden]),select,button")?.focus({ preventScroll: true });
  }

  function categoryOptions(type, current = "") {
    const options = type === "income" ? ["Income"] : type === "transfer" ? ["Savings"] : Object.keys(CATEGORY_COLORS).filter((name) => !["Income", "Savings"].includes(name));
    return options.map((name) => `<option value="${escapeHTML(name)}" ${name === current ? "selected" : ""}>${escapeHTML(name)}</option>`).join("");
  }

  function openTransactionModal(id = "") {
    const old = state.transactions.find((tx) => tx.id === id);
    const today = new Date();
    const defaultDate = `${state.currentMonth}-${String(Math.min(21, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())).padStart(2, "0")}`;
    const tx = old || { type: "expense", amount: "", category: "Essentials", date: defaultDate, payment: "UPI", description: "" };
    const body = `<form id="transaction-form" novalidate><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" />
      <div class="form-grid">
        <div class="form-field full"><label for="tx-description">Description</label><input id="tx-description" name="description" maxlength="100" required placeholder="e.g. Groceries" value="${escapeHTML(tx.description)}" /></div>
        <div class="form-field"><label for="tx-type">Type</label><select id="tx-type" name="type"><option value="expense" ${tx.type === "expense" ? "selected" : ""}>Expense</option><option value="income" ${tx.type === "income" ? "selected" : ""}>Income</option><option value="transfer" ${tx.type === "transfer" ? "selected" : ""}>Transfer to savings</option></select></div>
        <div class="form-field"><label for="tx-amount">Amount</label><input id="tx-amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" value="${tx.amount === "" ? "" : escapeHTML(tx.amount)}" /></div>
        <div class="form-field"><label for="tx-category">Category</label><select id="tx-category" name="category">${categoryOptions(tx.type, tx.category)}</select></div>
        <div class="form-field"><label for="tx-date">Date</label><input id="tx-date" name="date" type="date" required value="${escapeHTML(tx.date)}" /></div>
        <div class="form-field full"><label for="tx-payment">Payment method</label><select id="tx-payment" name="payment"><option ${tx.payment === "UPI" ? "selected" : ""}>UPI</option><option ${tx.payment === "Bank transfer" ? "selected" : ""}>Bank transfer</option><option ${tx.payment === "Auto-pay" ? "selected" : ""}>Auto-pay</option><option ${tx.payment === "Cash" ? "selected" : ""}>Cash</option><option ${tx.payment === "Card" ? "selected" : ""}>Card</option><option ${tx.payment === "Transfer" ? "selected" : ""}>Transfer</option><option ${tx.payment === "Salary" ? "selected" : ""}>Salary</option><option value="Other">Other</option></select></div>
      </div><div class="form-error" id="tx-error" role="alert"></div>
      <div class="modal-actions ${old ? "split-actions" : ""}">${old ? `<button type="button" class="btn btn-danger btn-small" data-action="delete-transaction" data-id="${escapeHTML(old.id)}">Delete</button>` : ""}<button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${old ? "Save changes" : "Add transaction"}</button></div>
      </form>`;
    modalShell(old ? "Edit transaction" : "Add transaction", "Record money in, money out, or a savings transfer.", body);
  }

  function openBudgetModal() {
    const categoryFields = Object.entries(state.budgets).map(([name, amount]) => `<div class="form-field"><label for="budget-${escapeHTML(name)}">${escapeHTML(name)} limit</label><input id="budget-${escapeHTML(name)}" name="category:${escapeHTML(name)}" type="number" min="0" step="1" value="${escapeHTML(amount)}" /></div>`).join("");
    const body = `<form id="budget-form"><div class="form-grid"><div class="form-field full"><label for="monthly-limit">Monthly spending limit</label><input id="monthly-limit" name="monthlyLimit" type="number" min="0" step="1" value="${escapeHTML(state.monthlyLimit)}" required /></div>${categoryFields}</div><div class="form-error" id="budget-error" role="alert"></div><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save budget</button></div></form>`;
    modalShell("Edit budget limits", "Set one monthly limit and optional limits for each category.", body, true);
  }

  function openGoalModal(id = "") {
    const old = state.goals.find((goal) => goal.id === id);
    const goal = old || { name: "", target: "", saved: "", priority: "Medium", color: "#39c6c5" };
    const body = `<form id="goal-form"><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" /><div class="form-grid">
      <div class="form-field full"><label for="goal-name">Goal name</label><input id="goal-name" name="name" maxlength="60" required placeholder="e.g. Emergency fund" value="${escapeHTML(goal.name)}" /></div>
      <div class="form-field"><label for="goal-target">Target amount</label><input id="goal-target" name="target" type="number" min="1" step="1" required value="${goal.target === "" ? "" : escapeHTML(goal.target)}" /></div>
      <div class="form-field"><label for="goal-saved">Already saved</label><input id="goal-saved" name="saved" type="number" min="0" step="1" value="${goal.saved === "" ? "" : escapeHTML(goal.saved)}" /></div>
      <div class="form-field"><label for="goal-priority">Priority</label><select id="goal-priority" name="priority"><option ${goal.priority === "High" ? "selected" : ""}>High</option><option ${goal.priority === "Medium" ? "selected" : ""}>Medium</option><option ${goal.priority === "Low" ? "selected" : ""}>Low</option></select></div>
      <div class="form-field"><label for="goal-color">Color</label><select id="goal-color" name="color"><option value="#39c6c5" ${goal.color === "#39c6c5" ? "selected" : ""}>Teal</option><option value="#a873ee" ${goal.color === "#a873ee" ? "selected" : ""}>Purple</option><option value="#ff7d38" ${goal.color === "#ff7d38" ? "selected" : ""}>Orange</option><option value="#39c98a" ${goal.color === "#39c98a" ? "selected" : ""}>Green</option></select></div>
      </div><div class="form-error" id="goal-error" role="alert"></div>
      <div class="modal-actions ${old ? "split-actions" : ""}">${old ? `<button type="button" class="btn btn-danger btn-small" data-action="delete-goal" data-id="${escapeHTML(old.id)}">Delete goal</button>` : ""}<button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${old ? "Save goal" : "Add goal"}</button></div></form>`;
    modalShell(old ? "Edit savings goal" : "Add savings goal", "Track progress toward a goal that matters to you.", body);
  }

  function openLoanModal(id = "") {
    const old = state.loans.find((loan) => loan.id === id);
    const loan = old || { name: "", amount: "", interest: "", note: "" };
    const body = `<form id="loan-form"><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" /><div class="form-grid">
      <div class="form-field full"><label for="loan-name">Loan name</label><input id="loan-name" name="name" maxlength="60" required placeholder="e.g. Personal loan" value="${escapeHTML(loan.name)}" /></div>
      <div class="form-field"><label for="loan-amount">Principal amount</label><input id="loan-amount" name="amount" type="number" min="0" step="0.01" required value="${escapeHTML(loan.amount)}" /></div>
      <div class="form-field"><label for="loan-interest">Interest amount</label><input id="loan-interest" name="interest" type="number" min="0" step="0.01" required value="${escapeHTML(loan.interest)}" /></div>
      <div class="form-field full"><label for="loan-note">Note</label><input id="loan-note" name="note" maxlength="100" placeholder="e.g. Pay ASAP" value="${escapeHTML(loan.note || "")}" /></div>
      </div><div class="form-error" id="loan-error" role="alert"></div>
      <div class="modal-actions ${old ? "split-actions" : ""}">${old ? `<button type="button" class="btn btn-danger btn-small" data-action="delete-loan" data-id="${escapeHTML(old.id)}">Delete loan</button>` : ""}<button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${old ? "Save changes" : "Add loan"}</button></div></form>`;
    modalShell(old ? "Edit loan" : "Add loan", "Record a loan's principal and interest amount.", body);
  }

  function openPlannedItemModal(id = "", group = "Necessity") {
    const old = state.plannedItems.find((item) => item.id === id);
    const item = old || { name: "", amount: "", group, checked: false };
    const bounds = plannedPriceBounds(item);
    const body = `<form id="planned-item-form"><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" /><div class="form-grid">
      <div class="form-field full"><label for="planned-name">Wishlist item</label><input id="planned-name" name="name" maxlength="80" required placeholder="e.g. Mechanical keyboard" value="${escapeHTML(item.name)}" /></div>
      <div class="form-field"><label for="planned-min-amount">Minimum price</label><input id="planned-min-amount" name="minAmount" type="number" min="0" step="0.01" placeholder="Optional" value="${bounds ? escapeHTML(bounds.min) : ""}" /></div>
      <div class="form-field"><label for="planned-max-amount">Maximum price</label><input id="planned-max-amount" name="maxAmount" type="number" min="0" step="0.01" placeholder="Optional" value="${bounds ? escapeHTML(bounds.max) : ""}" /></div>
      <div class="form-field"><label for="planned-group">Section</label><select id="planned-group" name="group"><option ${item.group === "Necessity" ? "selected" : ""}>Necessity</option><option ${item.group === "Priority" ? "selected" : ""}>Priority</option><option ${item.group === "Trivial" ? "selected" : ""}>Trivial</option></select></div>
      <div class="form-field"><label for="planned-note">Note (optional)</label><input id="planned-note" name="note" maxlength="140" placeholder="e.g. Only if needed" value="${escapeHTML(item.note || "")}" /></div>
      </div><div class="form-error" id="planned-item-error" role="alert"></div>
      <div class="modal-actions ${old ? "split-actions" : ""}">${old ? `<button type="button" class="btn btn-danger btn-small" data-action="delete-planned-item" data-id="${escapeHTML(old.id)}">Remove item</button>` : ""}<button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${old ? "Save changes" : "Add to wishlist"}</button></div></form>`;
    modalShell(old ? "Edit wishlist item" : "Add wishlist item", "Add an item and its price to a section.", body);
  }

  function openTripModal(id = "") {
    const old = state.trips.find((trip) => trip.id === id);
    const trip = old || { name: "", minBudget: "", maxBudget: "", target: "", note: "" };
    const body = `<form id="trip-form"><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" /><div class="form-grid">
      <div class="form-field full"><label for="trip-name">Trip name</label><input id="trip-name" name="name" maxlength="80" required placeholder="e.g. Nepal trip" value="${escapeHTML(trip.name)}" /></div>
      <div class="form-field"><label for="trip-min-budget">Minimum budget</label><input id="trip-min-budget" name="minBudget" type="number" min="0" step="1" required value="${trip.minBudget === "" ? "" : escapeHTML(trip.minBudget)}" /></div>
      <div class="form-field"><label for="trip-max-budget">Maximum budget</label><input id="trip-max-budget" name="maxBudget" type="number" min="0" step="1" required value="${trip.maxBudget === "" ? "" : escapeHTML(trip.maxBudget)}" /></div>
      <div class="form-field"><label for="trip-target">Savings target</label><input id="trip-target" name="target" type="number" min="0" step="1" placeholder="Defaults to maximum budget" value="${trip.target === "" ? "" : escapeHTML(trip.target)}" /></div>
      <div class="form-field"><label for="trip-note">Note (optional)</label><input id="trip-note" name="note" maxlength="140" value="${escapeHTML(trip.note || "")}" /></div>
      </div><div class="form-error" id="trip-error" role="alert"></div>
      <div class="modal-actions ${old ? "split-actions" : ""}">${old ? `<button type="button" class="btn btn-danger btn-small" data-action="delete-trip" data-id="${escapeHTML(old.id)}">Delete trip</button>` : ""}<button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${old ? "Save changes" : "Add trip"}</button></div></form>`;
    modalShell(old ? "Edit travel plan" : "Add travel plan", "Set a budget range and how much you want to save.", body);
  }

  function openTripCompletionModal(id) {
    const trip = state.trips.find((item) => item.id === id);
    if (!trip) return;
    const defaultSpend = Math.min(Number(trip.target) || 0, Number(state.travelFund) || 0);
    const body = `<form id="trip-complete-form"><input type="hidden" name="id" value="${escapeHTML(trip.id)}" /><div class="form-grid">
      <div class="form-field full"><label for="trip-actual-cost">Actual amount spent</label><input id="trip-actual-cost" name="actualCost" type="number" min="0" step="0.01" required value="${escapeHTML(defaultSpend)}" /></div>
      <div class="form-field full"><label for="trip-completed-at">Completion date</label><input id="trip-completed-at" name="completedAt" type="date" required value="${todayISO()}" /></div>
      </div><p class="form-hint">This amount will be deducted from the ${escapeHTML(formatMoney(state.travelFund || 0))} travel fund. If the trip cost more than the saved balance, the fund will be set to zero.</p>
      <div class="form-error" id="trip-complete-error" role="alert"></div><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Complete trip</button></div></form>`;
    modalShell(`Complete ${trip.name}`, "Save this trip to your completed history and settle its travel fund amount.", body);
  }

  function openTravelContributionModal() {
    const body = `<form id="travel-contribution-form"><div class="form-field"><label for="travel-contribution">Transfer amount</label><input id="travel-contribution" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></div><div class="form-error" id="travel-contribution-error" role="alert"></div><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Record transfer</button></div></form>`;
    modalShell("Transfer into travel fund", `Current fund: ${formatMoney(state.travelFund || 0)}. This will also be saved as a transaction.`, body);
  }

  function openJobModal(id = "") {
    const old = state.jobs.find((job) => job.id === id);
    const job = old || { name: "", dailyRate: "", overtimeRate: "" };
    const body = `<form id="job-form"><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" /><div class="form-grid">
      <div class="form-field full"><label for="job-name">Job or employer</label><input id="job-name" name="name" maxlength="60" required placeholder="e.g. Blinkit" value="${escapeHTML(job.name)}" /></div>
      <div class="form-field"><label for="job-daily-rate">Default payout per workday</label><input id="job-daily-rate" name="dailyRate" type="number" min="0" step="0.01" required value="${escapeHTML(job.dailyRate)}" /></div>
      <div class="form-field"><label for="job-overtime-rate">Default overtime payout per hour</label><input id="job-overtime-rate" name="overtimeRate" type="number" min="0" step="0.01" required value="${escapeHTML(job.overtimeRate)}" /></div>
      </div><p class="form-hint">These are defaults for new monthly records. Each saved month keeps its own rates.</p><div class="form-error" id="job-error" role="alert"></div>
      <div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${old ? "Save job" : "Add job"}</button></div></form>`;
    modalShell(old ? "Edit job profile" : "Add job profile", "Keep pay rates and salary history separate for each job.", body);
  }

  function openSalaryModal(id = "") {
    const old = state.salaryRecords.find((record) => record.id === id);
    const job = old ? state.jobs.find((item) => item.id === old.jobId) : activeJob();
    if (!job) return;
    const record = old || {
      month: state.currentMonth,
      paidOn: todayISO(),
      workingDays: "",
      dailyRate: job.dailyRate,
      overtimeHours: 0,
      overtimeRate: job.overtimeRate,
      otherEarnings: 0,
      deductions: 0
    };
    const body = `<form id="salary-form"><input type="hidden" name="id" value="${escapeHTML(old?.id || "")}" /><input type="hidden" name="jobId" value="${escapeHTML(job.id)}" />
      <div class="salary-job-context"><strong>${escapeHTML(job.name)}</strong><span>Monthly salary record</span></div>
      <div class="form-grid">
        <div class="form-field"><label for="salary-month">Salary month</label><input id="salary-month" name="month" type="month" required value="${escapeHTML(record.month)}" /></div>
        <div class="form-field"><label for="salary-paid-on">Paid on</label><input id="salary-paid-on" name="paidOn" type="date" required value="${escapeHTML(record.paidOn)}" /></div>
        <div class="form-field"><label for="salary-days">Days worked</label><input id="salary-days" name="workingDays" type="number" min="0" step="0.5" required value="${escapeHTML(record.workingDays)}" /></div>
        <div class="form-field"><label for="salary-day-rate">Payout per day</label><input id="salary-day-rate" name="dailyRate" type="number" min="0" step="0.01" required value="${escapeHTML(record.dailyRate)}" /></div>
        <div class="form-field"><label for="salary-overtime-hours">Overtime hours</label><input id="salary-overtime-hours" name="overtimeHours" type="number" min="0" step="0.25" required value="${escapeHTML(record.overtimeHours)}" /></div>
        <div class="form-field"><label for="salary-overtime-rate">Overtime payout per hour</label><input id="salary-overtime-rate" name="overtimeRate" type="number" min="0" step="0.01" required value="${escapeHTML(record.overtimeRate)}" /></div>
        <div class="form-field"><label for="salary-other">Other earnings</label><input id="salary-other" name="otherEarnings" type="number" min="0" step="0.01" value="${escapeHTML(record.otherEarnings)}" /></div>
        <div class="form-field"><label for="salary-deductions">Deductions</label><input id="salary-deductions" name="deductions" type="number" min="0" step="0.01" value="${escapeHTML(record.deductions)}" /></div>
      </div>
      <div class="salary-preview" aria-live="polite"><div><span>Regular payout</span><strong id="salary-preview-base">${escapeHTML(formatMoney(Number(record.workingDays || 0) * Number(record.dailyRate || 0)))}</strong></div><div><span>Overtime payout</span><strong id="salary-preview-overtime">${escapeHTML(formatMoney(Number(record.overtimeHours || 0) * Number(record.overtimeRate || 0)))}</strong></div><div class="salary-preview-total"><span>Salary this month</span><strong id="salary-preview-total">${escapeHTML(formatMoney(record.totalSalary || (Number(record.workingDays || 0) * Number(record.dailyRate || 0) + Number(record.overtimeHours || 0) * Number(record.overtimeRate || 0) + Number(record.otherEarnings || 0) - Number(record.deductions || 0))))}</strong></div></div>
      <p class="form-hint">The salary total is recorded as income on the paid date. Rates and overtime details stay saved with this month’s history.</p>
      <div class="form-error" id="salary-error" role="alert"></div><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${old ? "Save salary record" : "Save salary"}</button></div></form>`;
    modalShell(old ? "Edit salary record" : "Record salary this month", `Enter ${job.name} workdays, daily payout and overtime.`, body, true);
    updateSalaryPreview();
  }

  function updateSalaryPreview() {
    const form = modalRoot.querySelector("#salary-form");
    if (!form) return;
    const value = (name) => Number(Array.from(form.elements).find((control) => control.name === name)?.value) || 0;
    const base = value("workingDays") * value("dailyRate");
    const overtime = value("overtimeHours") * value("overtimeRate");
    const total = Math.max(0, base + overtime + value("otherEarnings") - value("deductions"));
    modalRoot.querySelector("#salary-preview-base").textContent = formatMoney(base);
    modalRoot.querySelector("#salary-preview-overtime").textContent = formatMoney(overtime);
    modalRoot.querySelector("#salary-preview-total").textContent = formatMoney(total);
  }

  function openOpeningBalanceModal() {
    const body = `<form id="opening-form"><div class="form-field"><label for="opening-balance">Starting balance</label><input id="opening-balance" name="balance" type="number" step="0.01" value="${escapeHTML(state.openingBalance || 0)}" /></div><div class="form-error" id="opening-error"></div><div class="modal-actions"><button type="button" class="btn btn-quiet" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save balance</button></div></form>`;
    modalShell("Set starting balance", "This is used in your available balance calculation.", body);
  }

  function exportFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvCell(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

  function exportCsv() {
    const rows = filteredTransactions();
    const content = [
      ["date", "description", "type", "category", "payment", "amount"].map(csvCell).join(","),
      ...rows.map((tx) => [tx.date, tx.description, tx.type, tx.category, tx.payment, tx.amount].map(csvCell).join(","))
    ].join("\r\n");
    exportFile(`ledger-transactions-${state.currentMonth}.csv`, `\uFEFF${content}`, "text/csv;charset=utf-8");
    showToast(`Exported ${rows.length} transaction${rows.length === 1 ? "" : "s"} to CSV.`);
  }

  function exportBackup() {
    exportFile(`ledger-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), "application/json");
    showToast("Ledger backup downloaded.");
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) { row.push(cell); cell = ""; }
      else if ((ch === "\n" || ch === "\r") && !quoted) {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((v) => v.trim() !== ""));
  }

  async function importCsvFile(file) {
    const rows = parseCSV(await file.text());
    if (rows.length < 2) { showToast("That CSV does not contain any transaction rows."); return; }
    const headers = rows[0].map((header) => header.trim().toLowerCase());
    const idx = (name) => headers.indexOf(name);
    if (idx("date") < 0 || idx("description") < 0 || idx("amount") < 0) {
      showToast("CSV needs date, description and amount columns."); return;
    }
    const imported = [];
    for (const row of rows.slice(1)) {
      const amountRaw = Number(String(row[idx("amount")] || "").replace(/[,$₹\s]/g, ""));
      const description = (row[idx("description")] || "").trim();
      const date = (row[idx("date")] || "").trim().slice(0, 10);
      if (!description || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(amountRaw) || amountRaw === 0) continue;
      let type = idx("type") >= 0 ? (row[idx("type")] || "").trim().toLowerCase() : "";
      if (!["income", "expense", "transfer"].includes(type)) type = amountRaw < 0 ? "expense" : "income";
      const fallbackCategory = type === "income" ? "Income" : type === "transfer" ? "Savings" : "Other";
      imported.push({ id: uid(), description, date, type, amount: Math.abs(amountRaw), category: (idx("category") >= 0 && row[idx("category")]?.trim()) || fallbackCategory, payment: (idx("payment") >= 0 && row[idx("payment")]?.trim()) || "Other" });
    }
    if (!imported.length) { showToast("No valid transaction rows were found in that CSV."); return; }
    state.transactions.push(...imported); saveState(); render();
    showToast(`Imported ${imported.length} transaction${imported.length === 1 ? "" : "s"}.`);
  }

  async function importBackupFile(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.transactions)) throw new Error("missing transactions");
      const defaults = freshState();
      const jobs = normalizeJobs(Array.isArray(parsed.jobs) ? parsed.jobs : defaults.jobs);
      state = {
        ...freshState(), ...parsed,
        transactions: parsed.transactions.map((tx) => ({ ...tx, id: tx.id || uid(), amount: Math.abs(Number(tx.amount) || 0) })),
        budgets: { ...STARTER_BUDGETS, ...(parsed.budgets || {}) },
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        loans: Array.isArray(parsed.loans) ? parsed.loans : deepCopy(STARTER_LOANS).map((loan) => ({ ...loan, id: uid() })),
        trips: normalizeTrips(Array.isArray(parsed.trips) ? parsed.trips : STARTER_TRIPS.map((trip) => ({ ...trip, id: uid() }))),
        completedTrips: normalizeCompletedTrips(Array.isArray(parsed.completedTrips) ? parsed.completedTrips : []),
        travelFund: Math.max(0, Number(parsed.travelFund) || 0),
        jobs,
        activeJobId: jobs.some((job) => job.id === parsed.activeJobId) ? parsed.activeJobId : (jobs[0]?.id || ""),
        salaryRecords: normalizeSalaryRecords(Array.isArray(parsed.salaryRecords) ? parsed.salaryRecords : [], jobs),
        plannedItems: migratePlannedItems(parsed.plannedItems, parsed.wishlistVersion),
        wishlistVersion: 2,
        currency: ["INR", "USD", "EUR", "GBP", "CAD", "AUD"].includes(parsed.currency) ? parsed.currency : "INR",
        currentMonth: isValidYearMonth(parsed.currentMonth) ? parsed.currentMonth : initialMonth,
        isSample: parsed.isSample === true
      };
      saveState(); render(); showToast("Backup restored on this device.");
    } catch {
      showToast("That file is not a valid Ledger backup.");
    }
  }

  function requestFile(inputId) {
    document.getElementById(inputId)?.click();
  }

  function handleAction(action, target) {
    const id = target.dataset.id;
    if (action === "add-transaction") openTransactionModal();
    else if (action === "edit-transaction") openTransactionModal(id);
    else if (action === "delete-transaction") {
      const index = state.transactions.findIndex((tx) => tx.id === id);
      if (index < 0) return;
      if (state.transactions[index].salaryRecordId) { showToast("Manage this linked income from Work & salary."); return; }
      const [deleted] = state.transactions.splice(index, 1);
      const previousTravelFund = state.travelFund;
      if (deleted.travelFundContribution) state.travelFund = Math.max(0, (Number(state.travelFund) || 0) - Number(deleted.amount || 0));
      closeModal(); saveState(); render(); showToast("Transaction deleted.", () => { state.transactions.splice(index, 0, deleted); state.travelFund = previousTravelFund; });
    }
    else if (action === "edit-budget") openBudgetModal();
    else if (action === "add-goal") openGoalModal();
    else if (action === "edit-goal") openGoalModal(id);
    else if (action === "delete-goal") {
      const index = state.goals.findIndex((goal) => goal.id === id);
      if (index < 0) return;
      const [deleted] = state.goals.splice(index, 1);
      closeModal(); saveState(); render(); showToast("Savings goal deleted.", () => state.goals.splice(index, 0, deleted));
    }
    else if (action === "add-loan") openLoanModal();
    else if (action === "edit-loan") openLoanModal(id);
    else if (action === "delete-loan") {
      const index = state.loans.findIndex((loan) => loan.id === id);
      if (index < 0) return;
      const [deleted] = state.loans.splice(index, 1);
      closeModal(); saveState(); render(); showToast("Loan deleted.", () => state.loans.splice(index, 0, deleted));
    }
    else if (action === "add-planned-item") openPlannedItemModal("", target.dataset.group || "Necessity");
    else if (action === "edit-planned-item") openPlannedItemModal(id);
    else if (action === "delete-planned-item") {
      const index = state.plannedItems.findIndex((item) => item.id === id);
      if (index < 0) return;
      const [deleted] = state.plannedItems.splice(index, 1);
      closeModal(); saveState(); render(); showToast("Wishlist item removed.", () => { state.plannedItems.splice(index, 0, deleted); saveState(); render(); });
    }
    else if (action === "add-trip") openTripModal();
    else if (action === "edit-trip") openTripModal(id);
    else if (action === "complete-trip") openTripCompletionModal(id);
    else if (action === "delete-trip") {
      const index = state.trips.findIndex((trip) => trip.id === id);
      if (index < 0) return;
      const [deleted] = state.trips.splice(index, 1);
      closeModal(); saveState(); render(); showToast("Travel plan deleted.", () => { state.trips.splice(index, 0, deleted); saveState(); render(); });
    }
    else if (action === "add-travel-contribution") openTravelContributionModal();
    else if (action === "add-job") openJobModal();
    else if (action === "edit-job") openJobModal(id);
    else if (action === "switch-job") {
      if (!state.jobs.some((job) => job.id === id)) return;
      state.activeJobId = id; saveState(); render();
      showToast(`${activeJob().name} is now your current job.`);
    }
    else if (action === "record-salary") {
      const record = salaryRecordFor(state.activeJobId, state.currentMonth);
      openSalaryModal(record?.id || "");
    }
    else if (action === "edit-salary") openSalaryModal(id);
    else if (action === "delete-salary") {
      const index = state.salaryRecords.findIndex((record) => record.id === id);
      if (index < 0) return;
      const [deleted] = state.salaryRecords.splice(index, 1);
      const txIndex = state.transactions.findIndex((tx) => tx.salaryRecordId === id || tx.id === deleted.transactionId);
      const deletedTx = txIndex >= 0 ? state.transactions.splice(txIndex, 1)[0] : null;
      closeModal(); saveState(); render();
      showToast("Salary record and linked income removed.", () => {
        state.salaryRecords.splice(index, 0, deleted);
        if (deletedTx) state.transactions.splice(Math.min(txIndex, state.transactions.length), 0, deletedTx);
      });
    }
    else if (action === "close-modal") closeModal();
    else if (action === "export-csv") exportCsv();
    else if (action === "export-backup") exportBackup();
    else if (action === "import-csv") requestFile("csv-file");
    else if (action === "import-backup") requestFile("backup-file");
    else if (action === "edit-opening") openOpeningBalanceModal();
    else if (action === "submit-form") {
      const form = target.closest("form");
      if (form) handleModalForm(form);
    }
    else if (action === "restore-starter") {
      if (!confirm("Restore the Ledger starter data? This replaces transactions, budgets, goals, loans, wishlists, travel plans, completed trips and job salary records saved in this browser.")) return;
      state = freshState(); saveState(); render(); showToast("Starter data restored.");
    }
    else if (action === "clear-starter-data") {
      if (!confirm("Clear all transactions, goals, loans, wishlist items, travel plans, completed trips, job profiles, salary records and budget limits saved in this browser? This cannot be undone unless you restore the starter data or import a backup.")) return;
      state.transactions = [];
      state.goals = [];
      state.loans = [];
      state.trips = [];
      state.completedTrips = [];
      state.travelFund = 0;
      state.jobs = [];
      state.activeJobId = "";
      state.salaryRecords = [];
      state.plannedItems = [];
      state.budgets = Object.fromEntries(Object.keys(STARTER_BUDGETS).map((name) => [name, 0]));
      state.monthlyLimit = 0;
      state.openingBalance = 0;
      state.isSample = false;
      saveState(); render(); showToast("Blank ledger ready on this device.");
    }
    else if (action === "page") { filters.page = Number(target.dataset.page) || 1; renderTransactionTable(); }
    else if (action === "backdrop-close" && target.classList.contains("modal-backdrop")) closeModal();
  }

  pageRoot.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-nav]");
    if (nav) { location.hash = `#${nav.dataset.nav}`; return; }
    const typeFilter = event.target.closest("[data-type-filter]");
    if (typeFilter) { filters.type = typeFilter.dataset.typeFilter; filters.page = 1; renderTransactions(); return; }
    const action = event.target.closest("[data-action]");
    if (action) handleAction(action.dataset.action, action);
  });

  document.querySelector(".sidebar").addEventListener("click", (event) => {
    const nav = event.target.closest("[data-nav]");
    if (nav) location.hash = `#${nav.dataset.nav}`;
  });

  modalRoot.addEventListener("click", (event) => {
    const submitButton = event.target.closest('.modal button[data-action="submit-form"]');
    if (submitButton) { handleModalForm(submitButton.closest("form")); return; }
    const modalAction = event.target.closest(".modal [data-action]");
    if (modalAction) { handleAction(modalAction.dataset.action, modalAction); return; }
    if (event.target.classList.contains("modal-backdrop")) closeModal();
  });

  pageRoot.addEventListener("input", (event) => {
    if (event.target.id === "transaction-search") {
      filters.query = event.target.value;
      filters.page = 1;
      renderTransactionTable();
    }
  });

  pageRoot.addEventListener("change", (event) => {
    if (event.target.id === "month-control") {
      if (/^\d{4}-\d{2}$/.test(event.target.value)) { state.currentMonth = event.target.value; saveState(); render(); }
    } else if (event.target.id === "category-filter") { filters.category = event.target.value; filters.page = 1; renderTransactionTable(); }
    else if (event.target.id === "date-filter") { filters.date = event.target.value; filters.page = 1; renderTransactionTable(); }
    else if (event.target.id === "payment-filter") { filters.payment = event.target.value; filters.page = 1; renderTransactionTable(); }
    else if (event.target.id === "currency-setting") { state.currency = event.target.value; saveState(); render(); showToast("Currency preference saved."); }
  });

  modalRoot.addEventListener("change", (event) => {
    if (event.target.id === "tx-type") {
      const category = modalRoot.querySelector("#tx-category");
      const preferred = event.target.value === "income" ? "Income" : event.target.value === "transfer" ? "Savings" : "Essentials";
      category.innerHTML = categoryOptions(event.target.value, preferred);
    }
  });

  modalRoot.addEventListener("input", (event) => {
    if (event.target.closest("#salary-form")) updateSalaryPreview();
  });

  modalRoot.addEventListener("submit", (event) => {
    event.preventDefault();
    handleModalForm(event.target);
  });

  function handleModalForm(form) {
    const formId = form.getAttribute("id");
    const get = (name) => Array.from(form.elements).find((control) => control.name === name)?.value ?? "";
    if (formId === "transaction-form") {
      const amount = Number(get("amount"));
      const description = String(get("description") || "").trim();
      const date = String(get("date") || "");
      const error = modalRoot.querySelector("#tx-error");
      if (!description || !date || !Number.isFinite(amount) || amount <= 0) { error.textContent = "Add a description, valid date and amount greater than zero."; return; }
      const id = String(get("id") || "");
      const type = String(get("type"));
      const category = String(get("category"));
      const index = state.transactions.findIndex((item) => item.id === id);
      const old = index >= 0 ? state.transactions[index] : null;
      if (old?.salaryRecordId) { error.textContent = "Edit or delete this linked income from Work & salary."; return; }
      const tx = { id: id || uid(), description, date, amount, type, category, payment: String(get("payment")) };
      if (old?.travelFundContribution) {
        const delta = type === "transfer" ? amount - Number(old.amount || 0) : -Number(old.amount || 0);
        state.travelFund = Math.max(0, (Number(state.travelFund) || 0) + delta);
        if (type === "transfer") tx.travelFundContribution = true;
      }
      if (index < 0) state.transactions.push(tx); else state.transactions[index] = tx;
      closeModal(); saveState(); render(); showToast(index < 0 ? "Transaction added." : "Transaction updated.");
    } else if (formId === "job-form") {
      const name = String(get("name") || "").trim();
      const dailyRate = Number(get("dailyRate"));
      const overtimeRate = Number(get("overtimeRate"));
      const error = modalRoot.querySelector("#job-error");
      if (!name || !Number.isFinite(dailyRate) || dailyRate < 0 || !Number.isFinite(overtimeRate) || overtimeRate < 0) { error.textContent = "Enter a job name and valid non-negative payout rates."; return; }
      const id = String(get("id") || "");
      const index = state.jobs.findIndex((job) => job.id === id);
      const job = { id: id || uid(), name, dailyRate, overtimeRate };
      if (index < 0) state.jobs.push(job); else state.jobs[index] = job;
      state.activeJobId = job.id;
      closeModal(); saveState(); render(); showToast(index < 0 ? `${name} added as your current job.` : `${name} job profile updated.`);
    } else if (formId === "salary-form") {
      const id = String(get("id") || "");
      const jobId = String(get("jobId") || "");
      const job = state.jobs.find((item) => item.id === jobId);
      const month = String(get("month") || "");
      const paidOn = String(get("paidOn") || "");
      const fields = ["workingDays", "dailyRate", "overtimeHours", "overtimeRate", "otherEarnings", "deductions"];
      const requiredFields = ["workingDays", "dailyRate", "overtimeHours", "overtimeRate"];
      const values = Object.fromEntries(fields.map((name) => [name, String(get(name) ?? "").trim()]));
      const numbers = Object.fromEntries(fields.map((name) => [name, Number(values[name] || 0)]));
      const error = modalRoot.querySelector("#salary-error");
      const validMonth = isValidYearMonth(month);
      const validNumbers = fields.every((name) => (!requiredFields.includes(name) || values[name] !== "") && Number.isFinite(numbers[name]) && numbers[name] >= 0);
      if (!job || !validMonth || !isValidISODate(paidOn) || !validNumbers) { error.textContent = "Enter a valid month, paid date and non-negative work and pay values."; return; }
      const existingIndex = state.salaryRecords.findIndex((record) => record.id === id);
      const duplicate = state.salaryRecords.find((record) => record.id !== id && record.jobId === jobId && record.month === month);
      if (duplicate) { error.textContent = `A ${monthLabel(month)} salary record already exists for ${job.name}. Edit that record instead.`; return; }
      const basePayout = numbers.workingDays * numbers.dailyRate;
      const overtimePayout = numbers.overtimeHours * numbers.overtimeRate;
      const totalSalary = Math.max(0, basePayout + overtimePayout + numbers.otherEarnings - numbers.deductions);
      const previousRecord = existingIndex >= 0 ? state.salaryRecords[existingIndex] : null;
      const record = {
        id: id || uid(), jobId, jobName: job.name, month, paidOn,
        workingDays: numbers.workingDays, dailyRate: numbers.dailyRate, basePayout,
        overtimeHours: numbers.overtimeHours, overtimeRate: numbers.overtimeRate, overtimePayout,
        otherEarnings: numbers.otherEarnings, deductions: numbers.deductions, totalSalary,
        transactionId: previousRecord?.transactionId || ""
      };
      if (existingIndex < 0) state.salaryRecords.push(record); else state.salaryRecords[existingIndex] = record;
      let linkedIndex = state.transactions.findIndex((tx) => tx.salaryRecordId === record.id || tx.id === record.transactionId);
      if (totalSalary > 0) {
        const transaction = {
          id: linkedIndex >= 0 ? state.transactions[linkedIndex].id : uid(),
          description: `${job.name} salary — ${monthLabel(month)}`,
          date: paidOn, type: "income", amount: totalSalary,
          category: "Income", payment: "Salary", salaryRecordId: record.id
        };
        record.transactionId = transaction.id;
        if (linkedIndex >= 0) state.transactions[linkedIndex] = transaction; else state.transactions.push(transaction);
      } else if (linkedIndex >= 0) {
        state.transactions.splice(linkedIndex, 1);
        record.transactionId = "";
      }
      state.activeJobId = jobId;
      state.currentMonth = month;
      closeModal(); saveState(); render();
      showToast(totalSalary > 0 ? (existingIndex < 0 ? "Salary saved and added to income." : "Salary record and income transaction updated.") : "Salary record saved. No income entry was needed for a zero total.");
    } else if (formId === "budget-form") {
      const limit = Number(get("monthlyLimit"));
      if (!Number.isFinite(limit) || limit < 0) { modalRoot.querySelector("#budget-error").textContent = "Enter a valid monthly limit."; return; }
      state.monthlyLimit = limit;
      for (const control of Array.from(form.elements)) {
        if (control.name?.startsWith("category:")) state.budgets[control.name.slice(9)] = Math.max(0, Number(control.value) || 0);
      }
      closeModal(); saveState(); render(); showToast("Budget limits saved.");
    } else if (formId === "goal-form") {
      const name = String(get("name") || "").trim();
      const target = Number(get("target"));
      const saved = Number(get("saved")) || 0;
      if (!name || !Number.isFinite(target) || target <= 0 || saved < 0) { modalRoot.querySelector("#goal-error").textContent = "Enter a name, a target above zero and a valid saved amount."; return; }
      const id = String(get("id") || "");
      const goal = { id: id || uid(), name, target, saved, priority: String(get("priority")), color: String(get("color")) };
      const index = state.goals.findIndex((item) => item.id === id);
      if (index < 0) state.goals.push(goal); else state.goals[index] = goal;
      closeModal(); saveState(); render(); showToast(index < 0 ? "Savings goal added." : "Savings goal updated.");
    } else if (formId === "loan-form") {
      const name = String(get("name") || "").trim();
      const amount = Number(get("amount"));
      const interest = Number(get("interest"));
      if (!name || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(interest) || interest < 0) { modalRoot.querySelector("#loan-error").textContent = "Enter a name and valid non-negative amounts."; return; }
      const id = String(get("id") || "");
      const loan = { id: id || uid(), name, amount, interest, note: String(get("note") || "").trim() };
      const index = state.loans.findIndex((item) => item.id === id);
      if (index < 0) state.loans.push(loan); else state.loans[index] = loan;
      closeModal(); saveState(); render(); showToast(index < 0 ? "Loan added." : "Loan updated.");
    } else if (formId === "planned-item-form") {
      const name = String(get("name") || "").trim();
      const minRaw = String(get("minAmount") || "").trim();
      const maxRaw = String(get("maxAmount") || "").trim();
      let minAmount = minRaw === "" ? null : Number(minRaw);
      let maxAmount = maxRaw === "" ? null : Number(maxRaw);
      if (!name || (minAmount !== null && (!Number.isFinite(minAmount) || minAmount < 0)) || (maxAmount !== null && (!Number.isFinite(maxAmount) || maxAmount < 0))) { modalRoot.querySelector("#planned-item-error").textContent = "Enter an item name and valid prices, or leave both prices blank."; return; }
      if (minAmount !== null || maxAmount !== null) {
        minAmount = minAmount ?? maxAmount;
        maxAmount = maxAmount ?? minAmount;
        if (minAmount > maxAmount) { modalRoot.querySelector("#planned-item-error").textContent = "Minimum price must not exceed maximum price."; return; }
      }
      const id = String(get("id") || "");
      const old = state.plannedItems.find((item) => item.id === id);
      const isFixedPrice = minAmount !== null && minAmount === maxAmount;
      const item = {
        id: id || uid(), name,
        amount: isFixedPrice ? minAmount : null,
        minAmount: minAmount !== null && !isFixedPrice ? minAmount : null,
        maxAmount: maxAmount !== null && !isFixedPrice ? maxAmount : null,
        group: String(get("group")), note: String(get("note") || "").trim(), checked: old?.checked || false
      };
      const index = state.plannedItems.findIndex((existing) => existing.id === id);
      if (index < 0) state.plannedItems.push(item); else state.plannedItems[index] = item;
      closeModal(); saveState(); render(); showToast(index < 0 ? "Added to wishlist." : "Wishlist item updated.");
    } else if (formId === "trip-form") {
      const name = String(get("name") || "").trim();
      const minBudget = Number(get("minBudget"));
      const maxBudget = Number(get("maxBudget"));
      const targetRaw = String(get("target") || "").trim();
      const target = targetRaw === "" ? maxBudget : Number(targetRaw);
      if (!name || !Number.isFinite(minBudget) || minBudget < 0 || !Number.isFinite(maxBudget) || maxBudget < minBudget || !Number.isFinite(target) || target <= 0) { modalRoot.querySelector("#trip-error").textContent = "Enter a trip name, a valid budget range and a savings target above zero."; return; }
      const id = String(get("id") || "");
      const trip = { id: id || uid(), name, minBudget, maxBudget, target, note: String(get("note") || "").trim() };
      const index = state.trips.findIndex((item) => item.id === id);
      if (index < 0) state.trips.push(trip); else state.trips[index] = trip;
      closeModal(); saveState(); render(); showToast(index < 0 ? "Travel plan added." : "Travel plan updated.");
    } else if (formId === "trip-complete-form") {
      const id = String(get("id") || "");
      const actualCostRaw = String(get("actualCost") || "").trim();
      const actualCost = Number(actualCostRaw);
      const completedAt = String(get("completedAt") || "");
      const error = modalRoot.querySelector("#trip-complete-error");
      if (actualCostRaw === "" || !Number.isFinite(actualCost) || actualCost < 0 || !isValidISODate(completedAt)) { error.textContent = "Enter a valid trip cost and completion date."; return; }
      const index = state.trips.findIndex((trip) => trip.id === id);
      if (index < 0) { error.textContent = "This travel plan could not be found."; return; }
      const previousTravelFund = state.travelFund;
      const [trip] = state.trips.splice(index, 1);
      const completedTrip = { ...trip, actualCost, completedAt };
      state.completedTrips.push(completedTrip);
      state.travelFund = Math.max(0, (Number(state.travelFund) || 0) - actualCost);
      closeModal(); saveState(); render();
      showToast(`${trip.name} saved to completed trips.`, () => {
        state.completedTrips = state.completedTrips.filter((item) => item.id !== completedTrip.id);
        state.trips.splice(index, 0, trip);
        state.travelFund = previousTravelFund;
      });
    } else if (formId === "travel-contribution-form") {
      const amount = Number(get("amount"));
      if (!Number.isFinite(amount) || amount <= 0) { modalRoot.querySelector("#travel-contribution-error").textContent = "Enter a contribution above zero."; return; }
      state.travelFund = Math.max(0, Number(state.travelFund) || 0) + amount;
      state.transactions.push({ id: uid(), description: "Travel fund contribution", date: todayISO(), type: "transfer", amount, category: "Savings", payment: "Transfer", travelFundContribution: true });
      closeModal(); saveState(); render(); showToast(`${formatMoney(amount)} transferred into the travel fund and recorded in Transactions.`);
    } else if (formId === "opening-form") {
      const balance = Number(get("balance"));
      if (!Number.isFinite(balance)) { modalRoot.querySelector("#opening-error").textContent = "Enter a valid balance."; return; }
      state.openingBalance = balance; closeModal(); saveState(); render(); showToast("Starting balance saved.");
    }
  }

  pageRoot.addEventListener("change", (event) => {
    if (event.target.matches("[data-plan-item]")) {
      const item = state.plannedItems.find((planned) => planned.id === event.target.dataset.id);
      if (!item) return;
      item.checked = event.target.checked;
      saveState(); render();
    }
    if (event.target.id === "csv-file" && event.target.files?.[0]) {
      const file = event.target.files[0]; event.target.value = ""; importCsvFile(file);
    }
    if (event.target.id === "backup-file" && event.target.files?.[0]) {
      const file = event.target.files[0]; event.target.value = ""; importBackupFile(file);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalRoot.innerHTML) closeModal();
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && modalRoot.querySelector("form")) modalRoot.querySelector("form").requestSubmit();
  });

  window.addEventListener("hashchange", () => { filters.page = 1; render(); });
  render();
})();
