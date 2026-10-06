const STORAGE_KEY = "fdi_program_kerja";
const divisions = ["Pengurus Inti", "PSDM", "MENHAS", "Organisasi", "PKM", "Prediksi"];

const defaultPrograms = [
    { id: 1, title: "Rapat Kerja Pengurus", division: "Pengurus Inti", date: "2026-10-10", status: "Berjalan", location: "Sekretariat FDI", description: "Evaluasi dan koordinasi program kerja pengurus." },
    { id: 2, title: "Upgrading Pengurus", division: "PSDM", date: "2026-10-18", status: "Coming Soon", location: "Aula UMM", description: "Kegiatan pengembangan kapasitas dan kekompakan pengurus." },
    { id: 3, title: "Media Campaign FDI", division: "MENHAS", date: "2026-10-22", status: "Coming Soon", location: "Online", description: "Publikasi dan kampanye kegiatan FDI melalui media sosial." },
    { id: 4, title: "Forum Diskusi Internal", division: "Organisasi", date: "2026-10-14", status: "Berjalan", location: "Sekretariat FDI", description: "Forum untuk membahas evaluasi organisasi dan kebutuhan anggota." },
    { id: 5, title: "Pendampingan PKM", division: "PKM", date: "2026-10-25", status: "Coming Soon", location: "Laboratorium Informatika", description: "Pendampingan penyusunan proposal PKM anggota FDI." },
    { id: 6, title: "Prediksi LKTI", division: "Prediksi", date: "2026-11-05", status: "Coming Soon", location: "Universitas Muhammadiyah Malang", description: "Program kerja pengembangan dan pendampingan karya ilmiah." }
];

let programs =
    JSON.parse(localStorage.getItem(STORAGE_KEY));

if (!programs) {
    programs = defaultPrograms;
    save();
}
let currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let editingId = null;

const $ = id => document.getElementById(id);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

function formatDate(date) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date + "T00:00:00"));
}

function statusClass(status) {
    return status === "Berjalan" ? "running" : status === "Selesai" ? "done" : "coming";
}

function renderSummary() {
    $("totalProker").textContent = programs.length;
    $("comingProker").textContent = programs.filter(p => p.status === "Coming Soon").length;
    $("runningProker").textContent = programs.filter(p => p.status === "Berjalan").length;
    $("doneProker").textContent = programs.filter(p => p.status === "Selesai").length;
}

function renderPrograms() {
    const divisionFilter = $("divisionFilter").value;
    const statusFilter = $("statusFilter").value;
    const container = $("divisionSections");
    container.innerHTML = "";

    divisions.forEach(division => {
        if (divisionFilter !== "Semua Divisi" && divisionFilter !== division) return;
        const items = programs.filter(p => p.division === division && (statusFilter === "Semua Status" || p.status === statusFilter)).sort((a,b) => a.date.localeCompare(b.date));
        if (!items.length) return;

        const section = document.createElement("section");
        section.className = "division-section";
        section.innerHTML = `<div class="division-heading"><div><span class="division-label">DIVISI</span><h3>${escapeHTML(division)}</h3></div><span class="division-count">${items.length} proker</span></div><div class="proker-list">${items.map(cardHTML).join("")}</div>`;
        container.appendChild(section);
    });

    if (!container.children.length) container.innerHTML = `<div class="empty-state"><strong>Belum ada program kerja</strong><span>Coba ubah filter atau tambahkan program kerja baru.</span></div>`;
}

function cardHTML(p) {
    return `<article class="proker-card" data-id="${p.id}">
        <div class="proker-card-top"><span class="status-badge ${statusClass(p.status)}"><i></i>${escapeHTML(p.status)}</span><div class="card-actions"><button onclick="editProgram(${p.id})" title="Edit">✎</button><button onclick="deleteProgram(${p.id})" title="Hapus">⌫</button></div></div>
        <h4>${escapeHTML(p.title)}</h4><p class="proker-description">${escapeHTML(p.description || "Tidak ada deskripsi.")}</p>
        <div class="proker-meta"><span>▣ ${formatDate(p.date)}</span><span>⌖ ${escapeHTML(p.location || "Belum ditentukan")}</span></div>
        <button class="detail-button" onclick="showDetail(${p.id})">Lihat detail →</button>
    </article>`;
}

function renderCalendar() {
    const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
    $("calendarMonth").textContent = new Intl.DateTimeFormat("id-ID", {month:"long", year:"numeric"}).format(currentMonth);
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const previousDays = new Date(year, month, 0).getDate();
    const grid = $("calendarGrid");
    grid.innerHTML = "";
    const today = new Date();

    for (let i=0; i<42; i++) {
        const number = i - firstDay + 1;
        let dateObj, dayNumber, outside = false;
        if (number < 1) { dayNumber = previousDays + number; dateObj = new Date(year, month - 1, dayNumber); outside = true; }
        else if (number > days) { dayNumber = number - days; dateObj = new Date(year, month + 1, dayNumber); outside = true; }
        else { dayNumber = number; dateObj = new Date(year, month, dayNumber); }
        const iso = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,"0")}-${String(dateObj.getDate()).padStart(2,"0")}`;
        const events = programs.filter(p => p.date === iso);
        const cell = document.createElement("button");
        cell.className = `calendar-day ${outside ? "outside" : ""} ${dateObj.toDateString() === today.toDateString() ? "today" : ""}`;
        cell.innerHTML = `<strong>${dayNumber}</strong>${events.slice(0,3).map(p => `<span class="calendar-event ${statusClass(p.status)}" title="${escapeHTML(p.title)}">${escapeHTML(p.title)}</span>`).join("")}${events.length > 3 ? `<small>+${events.length-3} agenda</small>` : ""}`;
        cell.addEventListener("click", () => events.length && showDetail(events[0].id));
        grid.appendChild(cell);
    }
}

function openForm(program = null) {
    editingId = program ? program.id : null;
    $("prokerModalTitle").textContent = program ? "Edit Program Kerja" : "Tambah Program Kerja";
    $("prokerId").value = program?.id || "";
    $("prokerName").value = program?.title || "";
    $("prokerDivision").value = program?.division || "Pengurus Inti";
    $("prokerStatus").value = program?.status || "Coming Soon";
    $("prokerDate").value = program?.date || "";
    $("prokerLocation").value = program?.location || "";
    $("prokerDescription").value = program?.description || "";
    $("prokerModal").classList.add("show");
}

function closeForm() { $("prokerModal").classList.remove("show"); }

function editProgram(id) { const program = programs.find(p => p.id === id); if (program) openForm(program); }

function deleteProgram(id) {
    const program = programs.find(p => p.id === id);
    if (!program || !confirm(`Hapus program kerja "${program.title}"?`)) return;
    programs = programs.filter(p => p.id !== id); save(); renderAll();
}

function showDetail(id) {
    const p = programs.find(item => item.id === id); if (!p) return;
    $("detailContent").innerHTML = `<span class="status-badge ${statusClass(p.status)}"><i></i>${escapeHTML(p.status)}</span><h2>${escapeHTML(p.title)}</h2><p class="detail-division">${escapeHTML(p.division)}</p><div class="detail-info"><div><span>Tanggal</span><strong>${formatDate(p.date)}</strong></div><div><span>Lokasi</span><strong>${escapeHTML(p.location || "Belum ditentukan")}</strong></div></div><div class="detail-description"><span>Deskripsi</span><p>${escapeHTML(p.description || "Tidak ada deskripsi.")}</p></div><div class="detail-actions"><button class="secondary-button" onclick="closeDetail()">Tutup</button><button class="primary-button" onclick="closeDetail(); editProgram(${p.id})">Edit Proker</button></div>`;
    $("detailModal").classList.add("show");
}
function closeDetail() { $("detailModal").classList.remove("show"); }

function renderAll() { renderSummary(); renderPrograms(); renderCalendar(); }

$("addProkerBtn").addEventListener("click", () => openForm());
$("closeProkerModal").addEventListener("click", closeForm);
$("cancelProker").addEventListener("click", closeForm);
$("closeDetailModal").addEventListener("click", closeDetail);
$("divisionFilter").addEventListener("change", renderPrograms);
$("statusFilter").addEventListener("change", renderPrograms);
$("prevMonth").addEventListener("click", () => { currentMonth.setMonth(currentMonth.getMonth()-1); renderCalendar(); });
$("nextMonth").addEventListener("click", () => { currentMonth.setMonth(currentMonth.getMonth()+1); renderCalendar(); });
$("prokerModal").addEventListener("click", e => { if (e.target === $("prokerModal")) closeForm(); });
$("detailModal").addEventListener("click", e => { if (e.target === $("detailModal")) closeDetail(); });

$("prokerForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = { id: editingId || Date.now(), title: $("prokerName").value.trim(), division: $("prokerDivision").value, status: $("prokerStatus").value, date: $("prokerDate").value, location: $("prokerLocation").value.trim(), description: $("prokerDescription").value.trim() };
    if (!data.title || !data.date) return;
    if (editingId) { const index = programs.findIndex(p => p.id === editingId); if (index !== -1) programs[index] = data; }
    else programs.push(data);
    save(); closeForm(); renderAll();
});

renderAll();
