/**
 * agenda.js — UKM FDI | Halaman Agenda
 * Fitur: Tambah/Edit/Hapus Agenda, Filter Multi-Kolom,
 *        List View (Timeline), Calendar View, Detail Modal,
 *        Konfirmasi Hapus, LocalStorage Persistence.
 */

"use strict";

/* ─────────────────────────────────────────────────────────
   CONSTANTS & DEFAULT DATA
───────────────────────────────────────────────────────── */
const AG_KEY = "fdi_agenda_v2";

const DIVISIONS = ["Pengurus Inti", "PSDM", "MENHAS", "Organisasi", "PKM", "Prediksi"];
const TIPE_LIST = ["Rapat", "Kegiatan", "Pelatihan", "Evaluasi", "Lainnya"];
const STATUS_LIST = ["Akan Datang", "Berlangsung", "Selesai", "Dibatalkan"];

const DEFAULT_AGENDAS = [
    {
        id: 1,
        name: "Rapat Koordinasi Pengurus Bulanan",
        divisi: "Pengurus Inti",
        tipe: "Rapat",
        date: "2026-10-28",
        time: "19:00",
        status: "Akan Datang",
        location: "Sekretariat FDI",
        pic: "Julian Abi",
        desc: "Rapat koordinasi rutin bulanan seluruh pengurus FDI untuk membahas perkembangan program kerja dan evaluasi kegiatan."
    },
    {
        id: 2,
        name: "Evaluasi Program Kerja Semester I",
        divisi: "Pengurus Inti",
        tipe: "Evaluasi",
        date: "2026-10-30",
        time: "16:00",
        status: "Akan Datang",
        location: "Student Center Lt. 2",
        pic: "Rina Hasanah",
        desc: "Evaluasi menyeluruh terhadap capaian program kerja semester pertama."
    },
    {
        id: 3,
        name: "Upgrading Anggota PSDM",
        divisi: "PSDM",
        tipe: "Kegiatan",
        date: "2026-11-05",
        time: "08:00",
        status: "Akan Datang",
        location: "Aula UMM",
        pic: "Ahmad Fauzi",
        desc: "Kegiatan pengembangan kapasitas, kepemimpinan, dan kekompakan seluruh anggota divisi PSDM."
    },
    {
        id: 4,
        name: "Pelatihan Karya Tulis Ilmiah",
        divisi: "PKM",
        tipe: "Pelatihan",
        date: "2026-11-03",
        time: "09:00",
        status: "Akan Datang",
        location: "Laboratorium Informatika",
        pic: "Dewi Rahayu",
        desc: "Pelatihan teknik penulisan karya ilmiah dan penyusunan proposal PKM untuk anggota FDI."
    },
    {
        id: 5,
        name: "Forum Diskusi Internal Organisasi",
        divisi: "Organisasi",
        tipe: "Rapat",
        date: "2026-10-14",
        time: "15:00",
        status: "Selesai",
        location: "Sekretariat FDI",
        pic: "Bagas Permana",
        desc: "Forum diskusi untuk membahas evaluasi organisasi dan kebutuhan anggota."
    },
    {
        id: 6,
        name: "Media Campaign FDI Oktober",
        divisi: "MENHAS",
        tipe: "Kegiatan",
        date: "2026-10-22",
        time: "10:00",
        status: "Berlangsung",
        location: "Online / Media Sosial",
        pic: "Siti Aisyah",
        desc: "Kampanye media sosial bulanan untuk mempromosikan kegiatan dan pencapaian FDI."
    },
    {
        id: 7,
        name: "Pendampingan Proposal PKM",
        divisi: "PKM",
        tipe: "Pelatihan",
        date: "2026-10-25",
        time: "13:00",
        status: "Akan Datang",
        location: "Lab. Komputer",
        pic: "Fariz Ardiansyah",
        desc: "Sesi pendampingan intensif penyusunan proposal PKM anggota FDI bersama mentor."
    },
    {
        id: 8,
        name: "Rapat Kerja Pengurus Inti",
        divisi: "Pengurus Inti",
        tipe: "Rapat",
        date: "2026-10-10",
        time: "19:00",
        status: "Selesai",
        location: "Sekretariat FDI",
        pic: "Julian Abi",
        desc: "Evaluasi dan koordinasi program kerja pengurus inti FDI."
    },
    {
        id: 9,
        name: "Prediksi LKTI Nasional",
        divisi: "Prediksi",
        tipe: "Pelatihan",
        date: "2026-11-15",
        time: "08:00",
        status: "Akan Datang",
        location: "UMM Convention Hall",
        pic: "Lutfi Rahman",
        desc: "Program pengembangan dan pendampingan karya ilmiah untuk persiapan LKTI tingkat nasional."
    },
    {
        id: 10,
        name: "Open Recruitment Anggota Baru",
        divisi: "PSDM",
        tipe: "Kegiatan",
        date: "2026-11-20",
        time: "08:00",
        status: "Akan Datang",
        location: "Gedung Student Center",
        pic: "Ahmad Fauzi",
        desc: "Kegiatan open recruitment anggota baru FDI periode 2026/2027."
    }
];

/* ─────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────── */
let agendas = JSON.parse(localStorage.getItem(AG_KEY)) || null;
if (!agendas) {
    agendas = DEFAULT_AGENDAS;
    saveAgendas();
}

let currentView = "list"; // "list" | "calendar"
let calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let editingId = null;
let deletingId = null;

/* ─────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const esc = v => String(v ?? "").replace(/[&<>'"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])
);

function saveAgendas() {
    localStorage.setItem(AG_KEY, JSON.stringify(agendas));
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "long", year: "numeric"
    }).format(new Date(dateStr + "T00:00:00"));
}

function formatDateShort(dateStr) {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit", month: "short"
    }).format(new Date(dateStr + "T00:00:00"));
}

function formatMonthYear(dateStr) {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        month: "long", year: "numeric"
    }).format(new Date(dateStr + "T00:00:00"));
}

function getMonthYearKey(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(key) {
    const [y, m] = key.split("-");
    return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
        .format(new Date(Number(y), Number(m) - 1, 1));
}

function toIso(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
}

function tipeBadgeClass(tipe) {
    const map = {
        "Rapat": "ag-badge-rapat",
        "Kegiatan": "ag-badge-kegiatan",
        "Pelatihan": "ag-badge-pelatihan",
        "Evaluasi": "ag-badge-evaluasi",
        "Lainnya": "ag-badge-lainnya"
    };
    return map[tipe] || "ag-badge-lainnya";
}

function tipeCardClass(tipe) {
    return "tipe-" + (tipe || "lainnya").toLowerCase();
}

function statusClass(status) {
    const map = {
        "Akan Datang": "akan-datang",
        "Berlangsung": "berlangsung",
        "Selesai": "selesai",
        "Dibatalkan": "dibatalkan"
    };
    return map[status] || "akan-datang";
}

/* ─────────────────────────────────────────────────────────
   FILTER HELPERS
───────────────────────────────────────────────────────── */
function getFiltered() {
    const search = ($("agSearch").value || "").trim().toLowerCase();
    const divisi = $("agFilterDivisi").value;
    const tipe   = $("agFilterTipe").value;
    const status = $("agFilterStatus").value;

    return agendas.filter(a => {
        if (search && !a.name.toLowerCase().includes(search) &&
            !(a.desc || "").toLowerCase().includes(search) &&
            !(a.location || "").toLowerCase().includes(search)) return false;
        if (divisi && a.divisi !== divisi) return false;
        if (tipe && a.tipe !== tipe) return false;
        if (status && a.status !== status) return false;
        return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
}

/* ─────────────────────────────────────────────────────────
   SUMMARY STATS
───────────────────────────────────────────────────────── */
function renderSummary() {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    $("statTotal").textContent     = agendas.length;
    $("statUpcoming").textContent  = agendas.filter(a => a.status === "Akan Datang" || a.status === "Berlangsung").length;
    $("statDone").textContent      = agendas.filter(a => a.status === "Selesai").length;
    $("statThisMonth").textContent = agendas.filter(a => getMonthYearKey(a.date) === thisMonth).length;
}

/* ─────────────────────────────────────────────────────────
   LIST / TIMELINE VIEW
───────────────────────────────────────────────────────── */
function renderListView() {
    const filtered = getFiltered();
    const container = $("agTimeline");
    container.innerHTML = "";

    if (!filtered.length) {
        container.innerHTML = `
            <div class="ag-empty">
                <div class="ag-empty-icon">📅</div>
                <strong>Tidak ada agenda ditemukan</strong>
                <p>Coba ubah filter atau tambahkan agenda baru.</p>
            </div>`;
        return;
    }

    // Group by month
    const groups = {};
    filtered.forEach(a => {
        const key = getMonthYearKey(a.date);
        if (!groups[key]) groups[key] = [];
        groups[key].push(a);
    });

    Object.entries(groups).forEach(([key, items]) => {
        const group = document.createElement("div");
        group.className = "ag-month-group";
        group.innerHTML = `
            <div class="ag-month-label">
                <h3>${formatMonthLabel(key)}</h3>
                <span class="ag-month-count">${items.length} agenda</span>
            </div>
            <div class="ag-cards-grid" id="grid-${key}"></div>`;
        container.appendChild(group);

        const grid = group.querySelector(`#grid-${key}`);
        items.forEach(a => {
            const card = document.createElement("article");
            card.className = `ag-card ${tipeCardClass(a.tipe)}`;
            card.dataset.id = a.id;
            card.innerHTML = `
                <div class="ag-card-top">
                    <div class="ag-card-badges">
                        <span class="ag-badge ${tipeBadgeClass(a.tipe)}">${esc(a.tipe)}</span>
                        <span class="ag-status ${statusClass(a.status)}">
                            <i></i>${esc(a.status)}
                        </span>
                    </div>
                    <div class="ag-card-actions">
                        <button onclick="openEditForm(${a.id})" title="Edit">✎</button>
                        <button class="delete-btn" onclick="openDeleteConfirm(${a.id})" title="Hapus">⌫</button>
                    </div>
                </div>
                <div class="ag-card-divisi">${esc(a.divisi)}</div>
                <h4>${esc(a.name)}</h4>
                <p class="ag-card-desc">${esc(a.desc || "Tidak ada deskripsi.")}</p>
                <div class="ag-card-meta">
                    <div class="ag-card-meta-item">
                        <span>📅</span><span>${formatDate(a.date)}${a.time ? " · " + a.time + " WIB" : ""}</span>
                    </div>
                    <div class="ag-card-meta-item">
                        <span>📍</span><span>${esc(a.location || "Belum ditentukan")}</span>
                    </div>
                    ${a.pic ? `<div class="ag-card-meta-item"><span>👤</span><span>${esc(a.pic)}</span></div>` : ""}
                </div>`;
            card.addEventListener("click", e => {
                if (!e.target.closest(".ag-card-actions")) openDetail(a.id);
            });
            grid.appendChild(card);
        });
    });
}

/* ─────────────────────────────────────────────────────────
   CALENDAR VIEW
───────────────────────────────────────────────────────── */
function renderCalendarView() {
    const year  = calMonth.getFullYear();
    const month = calMonth.getMonth();

    // Header label
    $("agCalMonthLabel").textContent = new Intl.DateTimeFormat("id-ID", {
        month: "long", year: "numeric"
    }).format(calMonth);

    const firstDay  = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const prevDays  = new Date(year, month, 0).getDate();
    const grid = $("agCalGrid");
    grid.innerHTML = "";
    const today = new Date();

    const filtered = getFiltered();

    for (let i = 0; i < 42; i++) {
        const num = i - firstDay + 1;
        let dateObj, dayNum, outside = false;

        if (num < 1) {
            dayNum = prevDays + num;
            dateObj = new Date(year, month - 1, dayNum);
            outside = true;
        } else if (num > daysCount) {
            dayNum = num - daysCount;
            dateObj = new Date(year, month + 1, dayNum);
            outside = true;
        } else {
            dayNum = num;
            dateObj = new Date(year, month, dayNum);
        }

        const iso    = toIso(dateObj);
        const events = filtered.filter(a => a.date === iso);
        const isToday = dateObj.toDateString() === today.toDateString();

        const cell = document.createElement("button");
        cell.className = `ag-cal-day ${outside ? "ag-outside" : ""} ${isToday ? "ag-today" : ""}`;
        cell.innerHTML = `<strong>${dayNum}</strong>
            ${events.slice(0, 3).map(a =>
                `<span class="ag-cal-event ${tipeCardClass(a.tipe)}" title="${esc(a.name)}">${esc(a.name)}</span>`
            ).join("")}
            ${events.length > 3 ? `<small>+${events.length - 3} lagi</small>` : ""}`;

        cell.addEventListener("click", () => {
            if (events.length === 1) openDetail(events[0].id);
            else if (events.length > 1) showDayEvents(iso, events);
        });

        grid.appendChild(cell);
    }

    // Sidebar
    renderCalSidebar(filtered);
}

function renderCalSidebar(filtered) {
    const year  = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthAgendas = filtered.filter(a => getMonthYearKey(a.date) === monthKey);

    $("agCalSidebarTitle").textContent = new Intl.DateTimeFormat("id-ID", {
        month: "long", year: "numeric"
    }).format(calMonth);
    $("agCalSidebarCount").textContent = `${monthAgendas.length} agenda`;

    const list = $("agCalSidebarList");
    list.innerHTML = "";

    if (!monthAgendas.length) {
        list.innerHTML = `<div style="text-align:center;padding:20px 0;color:#8a94a6;font-size:11px;">
            Tidak ada agenda bulan ini.</div>`;
        return;
    }

    monthAgendas.forEach(a => {
        const d = new Date(a.date + "T00:00:00");
        const day = String(d.getDate()).padStart(2, "0");
        const mon = d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase().replace(".", "");

        const item = document.createElement("div");
        item.className = "ag-sidebar-item";
        item.innerHTML = `
            <div class="ag-sidebar-date">
                <strong>${day}</strong>
                <span>${mon}</span>
            </div>
            <div class="ag-sidebar-info">
                <strong>${esc(a.name)}</strong>
                <span>${esc(a.tipe)} · ${a.time ? a.time + " WIB" : "Belum ditentukan"}</span>
                <span>${esc(a.location || "Belum ditentukan")}</span>
            </div>`;
        item.addEventListener("click", () => openDetail(a.id));
        list.appendChild(item);
    });
}

function showDayEvents(iso, events) {
    // Show first event detail for now; could expand to a mini-list
    openDetail(events[0].id);
}

/* ─────────────────────────────────────────────────────────
   RENDER CONTROLLER
───────────────────────────────────────────────────────── */
function renderAll() {
    renderSummary();
    if (currentView === "list") {
        renderListView();
    } else {
        renderCalendarView();
    }
}

/* ─────────────────────────────────────────────────────────
   DETAIL MODAL
───────────────────────────────────────────────────────── */
function openDetail(id) {
    const a = agendas.find(x => x.id === id);
    if (!a) return;

    $("agDetailContent").innerHTML = `
        <div class="ag-detail-header">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span class="ag-badge ${tipeBadgeClass(a.tipe)}">${esc(a.tipe)}</span>
                <span class="ag-status ${statusClass(a.status)}"><i></i>${esc(a.status)}</span>
            </div>
            <h2 class="ag-detail-title">${esc(a.name)}</h2>
            <p class="ag-detail-divisi">Divisi ${esc(a.divisi)}</p>
        </div>
        <div class="ag-detail-grid">
            <div class="ag-detail-field">
                <label>Tanggal</label>
                <strong>${formatDate(a.date)}</strong>
            </div>
            <div class="ag-detail-field">
                <label>Waktu</label>
                <strong>${a.time ? a.time + " WIB" : "Belum ditentukan"}</strong>
            </div>
            <div class="ag-detail-field">
                <label>Lokasi</label>
                <strong>${esc(a.location || "Belum ditentukan")}</strong>
            </div>
            <div class="ag-detail-field">
                <label>Penanggung Jawab</label>
                <strong>${esc(a.pic || "Belum ditentukan")}</strong>
            </div>
        </div>
        <div class="ag-detail-desc-box">
            <label>Deskripsi</label>
            <p>${esc(a.desc || "Tidak ada deskripsi.")}</p>
        </div>
        <div class="ag-detail-actions">
            <button class="secondary-button" onclick="closeDetail()">Tutup</button>
            <button class="secondary-button" onclick="closeDetail(); openDeleteConfirm(${a.id})">🗑 Hapus</button>
            <button class="primary-button" onclick="closeDetail(); openEditForm(${a.id})">✎ Edit</button>
        </div>`;

    $("agDetailModal").classList.add("show");
}

function closeDetail() {
    $("agDetailModal").classList.remove("show");
}

/* ─────────────────────────────────────────────────────────
   ADD / EDIT FORM
───────────────────────────────────────────────────────── */
function openAddForm() {
    editingId = null;
    $("agModalTitle").textContent = "Tambah Agenda";
    $("agId").value = "";
    $("agName").value = "";
    $("agDivisi").value = "Pengurus Inti";
    $("agTipe").value = "Rapat";
    $("agDate").value = "";
    $("agTime").value = "";
    $("agStatus").value = "Akan Datang";
    $("agLocation").value = "";
    $("agPIC").value = "";
    $("agDesc").value = "";
    $("agModal").classList.add("show");
    $("agName").focus();
}

function openEditForm(id) {
    const a = agendas.find(x => x.id === id);
    if (!a) return;
    editingId = id;
    $("agModalTitle").textContent = "Edit Agenda";
    $("agId").value      = a.id;
    $("agName").value    = a.name;
    $("agDivisi").value  = a.divisi;
    $("agTipe").value    = a.tipe;
    $("agDate").value    = a.date;
    $("agTime").value    = a.time || "";
    $("agStatus").value  = a.status;
    $("agLocation").value = a.location || "";
    $("agPIC").value     = a.pic || "";
    $("agDesc").value    = a.desc || "";
    $("agModal").classList.add("show");
    $("agName").focus();
}

function closeForm() {
    $("agModal").classList.remove("show");
}

/* ─────────────────────────────────────────────────────────
   DELETE CONFIRM
───────────────────────────────────────────────────────── */
function openDeleteConfirm(id) {
    const a = agendas.find(x => x.id === id);
    if (!a) return;
    deletingId = id;
    $("agDeleteMsg").textContent =
        `Apakah kamu yakin ingin menghapus agenda "${a.name}"? Tindakan ini tidak bisa dibatalkan.`;
    $("agDeleteModal").classList.add("show");
}

function closeDeleteModal() {
    $("agDeleteModal").classList.remove("show");
    deletingId = null;
}

function deleteAgenda(id) {
    agendas = agendas.filter(a => a.id !== id);
    saveAgendas();
    renderAll();
}

/* ─────────────────────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────────────────────── */
// Toolbar
$("addAgendaBtn").addEventListener("click", openAddForm);
$("agSearch").addEventListener("input", renderAll);
$("agFilterDivisi").addEventListener("change", renderAll);
$("agFilterTipe").addEventListener("change", renderAll);
$("agFilterStatus").addEventListener("change", renderAll);

// View toggle
$("btnViewList").addEventListener("click", () => {
    currentView = "list";
    $("btnViewList").classList.add("active");
    $("btnViewCalendar").classList.remove("active");
    $("agListView").classList.remove("hidden");
    $("agCalView").classList.add("hidden");
    renderAll();
});

$("btnViewCalendar").addEventListener("click", () => {
    currentView = "calendar";
    $("btnViewCalendar").classList.add("active");
    $("btnViewList").classList.remove("active");
    $("agCalView").classList.remove("hidden");
    $("agListView").classList.add("hidden");
    renderAll();
});

// Calendar nav
$("agCalPrev").addEventListener("click", () => {
    calMonth.setMonth(calMonth.getMonth() - 1);
    renderCalendarView();
});

$("agCalNext").addEventListener("click", () => {
    calMonth.setMonth(calMonth.getMonth() + 1);
    renderCalendarView();
});

// Form modal close
$("closeAgModal").addEventListener("click", closeForm);
$("cancelAg").addEventListener("click", closeForm);
$("agModal").addEventListener("click", e => { if (e.target === $("agModal")) closeForm(); });

// Detail modal close
$("closeAgDetail").addEventListener("click", closeDetail);
$("agDetailModal").addEventListener("click", e => { if (e.target === $("agDetailModal")) closeDetail(); });

// Delete modal
$("cancelDelete").addEventListener("click", closeDeleteModal);
$("agDeleteModal").addEventListener("click", e => { if (e.target === $("agDeleteModal")) closeDeleteModal(); });
$("confirmDelete").addEventListener("click", () => {
    if (deletingId !== null) {
        deleteAgenda(deletingId);
        closeDeleteModal();
    }
});

// Form submit
$("agForm").addEventListener("submit", e => {
    e.preventDefault();

    const name     = $("agName").value.trim();
    const date     = $("agDate").value;
    if (!name || !date) return;

    const data = {
        id:       editingId || Date.now(),
        name,
        divisi:   $("agDivisi").value,
        tipe:     $("agTipe").value,
        date,
        time:     $("agTime").value,
        status:   $("agStatus").value,
        location: $("agLocation").value.trim(),
        pic:      $("agPIC").value.trim(),
        desc:     $("agDesc").value.trim()
    };

    if (editingId) {
        const idx = agendas.findIndex(a => a.id === editingId);
        if (idx !== -1) agendas[idx] = data;
    } else {
        agendas.push(data);
    }

    saveAgendas();
    closeForm();
    renderAll();
});

// Keyboard: Escape closes modals
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeForm();
        closeDetail();
        closeDeleteModal();
    }
});

/* ─────────────────────────────────────────────────────────
   INITIAL RENDER
───────────────────────────────────────────────────────── */
renderAll();
