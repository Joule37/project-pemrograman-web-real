/**
 * dokumentasi.js — UKM FDI
 * Halaman dokumentasi: setiap agenda (dari localStorage "fdi_agenda_v2")
 * punya slot dokumentasi sendiri (localStorage "fdi_dokumentasi").
 */

/* ── Storage Keys ────────────────────────────────────────── */
const AG_KEY  = "fdi_agenda_v2";
const DOK_KEY = "fdi_dokumentasi";

/* ── Helpers ─────────────────────────────────────────────── */
const $   = id  => document.getElementById(id);
const esc = val => String(val ?? "").replace(/[&<>'"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])
);

function readStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        const out = raw ? JSON.parse(raw) : null;
        return Array.isArray(out) ? out : (out && typeof out === "object" ? out : null);
    } catch {
        return null;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "long", year: "numeric"
    }).format(new Date(dateStr + "T00:00:00"));
}

/* ── Data ────────────────────────────────────────────────── */

// Data agenda (baca dari halaman agenda)
let agendas = readStorage(AG_KEY);
if (!agendas) {
    agendas = [
        { id: 1, name: "Rapat Koordinasi Pengurus Inti", divisi: "Pengurus Inti", tipe: "Rapat",    date: "2026-10-10", time: "19:00", status: "Selesai",     location: "Sekretariat FDI",             pic: "Julian Abi",       description: "Rapat koordinasi rutin pengurus inti FDI untuk mengevaluasi capaian bulan Oktober." },
        { id: 2, name: "Upgrading Pengurus PSDM",        divisi: "PSDM",          tipe: "Kegiatan", date: "2026-10-18", time: "08:00", status: "Selesai",     location: "Aula UMM",                    pic: "Divisi PSDM",      description: "Upgrading kapasitas dan kekompakan pengurus divisi PSDM." },
        { id: 3, name: "Workshop Karya Ilmiah PKM",      divisi: "PKM",           tipe: "Pelatihan",date: "2026-10-25", time: "09:00", status: "Akan Datang", location: "Lab Informatika",             pic: "Divisi PKM",       description: "Pendampingan penyusunan proposal PKM 5 bidang untuk mahasiswa FDI." },
        { id: 4, name: "Evaluasi Program Kerja Q3",      divisi: "Organisasi",    tipe: "Evaluasi", date: "2026-10-14", time: "16:00", status: "Selesai",     location: "Sekretariat FDI",             pic: "Divisi Organisasi",description: "Evaluasi pelaksanaan program kerja kuartal 3 dan penyusunan rencana Q4." },
        { id: 5, name: "Media Campaign Semester Genap",  divisi: "MENHAS",        tipe: "Kegiatan", date: "2026-11-05", time: "10:00", status: "Akan Datang", location: "Online / Instagram Live",     pic: "Divisi MENHAS",    description: "Kampanye media sosial FDI untuk menaikkan awareness di kalangan mahasiswa baru." },
        { id: 6, name: "Prediksi & Analisis LKTI 2026",  divisi: "Prediksi",      tipe: "Pelatihan",date: "2026-11-12", time: "13:00", status: "Akan Datang", location: "Universitas Muhammadiyah Malang", pic: "Divisi Prediksi",  description: "Program pendampingan dan analisis tren LKTI tingkat nasional 2026." }
    ];
    localStorage.setItem(AG_KEY, JSON.stringify(agendas));
}

// ── Seed dokumentasi default ──────────────────────────────────────────────────
// Gunakan foto dari picsum.photos (layanan foto dummy gratis & stabil).
// Format: https://picsum.photos/seed/{keyword}/{width}/{height}
const defaultDokData = {
    // ─ Agenda 1: TERDOKUMENTASI lengkap dengan laporan + foto
    1: {
        status: "Selesai",
        laporan: `Rapat Koordinasi Pengurus Inti berlangsung pada 10 Oktober 2026 pukul 19.00 WIB di Sekretariat FDI.

Agenda rapat:
1. Evaluasi capaian program kerja bulan September
2. Pembahasan kendala pelaksanaan divisi MENHAS dan PKM
3. Penjadwalan ulang kegiatan Upgrading PSDM
4. Penyusunan timeline program kerja Q4

Hasil & kesimpulan:
- Sebagian besar program kerja berjalan sesuai rencana (80% on-track)
- Divisi PKM mendapatkan tambahan mentor eksternal dari alumni
- Timeline Q4 disepakati dan akan dibagikan ke seluruh anggota

Tindak lanjut:
- Ketua Umum: Koordinasi dengan Fakultas untuk peminjaman aula
- PSDM: Finalisasi materi upgrading sebelum 15 Oktober`,
        dokumenLink: "https://drive.google.com/",
        foto: [
            "https://picsum.photos/seed/meeting1/800/500",
            "https://picsum.photos/seed/rapat2/800/500",
            "https://picsum.photos/seed/discuss3/800/500",
            "https://picsum.photos/seed/office4/800/500"
        ],
        updatedAt: "2026-10-11T08:30:00Z"
    },

    // ─ Agenda 2: TERDOKUMENTASI dengan laporan & beberapa foto
    2: {
        status: "Selesai",
        laporan: `Upgrading Pengurus PSDM dilaksanakan pada 18 Oktober 2026, pukul 08.00–17.00 WIB di Aula UMM dengan dihadiri oleh 24 pengurus divisi PSDM.

Materi yang disampaikan:
• Public Speaking & Leadership (Sesi I — 08.00–10.30)
• Team Building & Manajemen Konflik (Sesi II — 10.45–12.30)
• Outbound & Ice Breaking (Sesi III — 13.30–16.00)
• Refleksi & Komitmen Bersama (Sesi IV — 16.00–17.00)

Evaluasi:
Kegiatan berlangsung sangat antusias. Seluruh peserta aktif dalam setiap sesi. Tingkat kepuasan peserta berdasarkan angket: 4.7/5.

Rekomendasi:
Kegiatan serupa perlu dilaksanakan secara rutin minimal 2× per semester untuk menjaga semangat dan kohesivitas pengurus.`,
        dokumenLink: "https://drive.google.com/",
        foto: [
            "https://picsum.photos/seed/team1/800/500",
            "https://picsum.photos/seed/training2/800/500",
            "https://picsum.photos/seed/group3/800/500"
        ],
        updatedAt: "2026-10-19T10:00:00Z"
    },

    // ─ Agenda 4: TERDOKUMENTASI evaluasi
    4: {
        status: "Selesai",
        laporan: `Evaluasi Program Kerja Q3 diselenggarakan pada 14 Oktober 2026 pukul 16.00 WIB di Sekretariat FDI.

Rangkuman evaluasi per divisi:
• Pengurus Inti  — 90% target tercapai ✅
• PSDM           — 85% target tercapai ✅
• MENHAS         — 70% target tercapai ⚠️ (terkendala sumber daya)
• Organisasi     — 95% target tercapai ✅
• PKM            — 60% target tercapai ⚠️ (perlu percepatan)
• Prediksi       — 80% target tercapai ✅

Keputusan:
- MENHAS dan PKM mendapat pendampingan intensif dari Ketua Umum
- Target Q4 disesuaikan dengan kapasitas dan waktu tersisa
- Review bulanan dijadwalkan setiap tanggal 14`,
        dokumenLink: "https://drive.google.com/",
        foto: [
            "https://picsum.photos/seed/eval1/800/500",
            "https://picsum.photos/seed/review2/800/500"
        ],
        updatedAt: "2026-10-15T09:00:00Z"
    },

    // ─ Agenda 3: SEDANG DIBUAT (belum selesai)
    3: {
        status: "Sedang Dibuat",
        laporan: "Workshop masih dalam tahap persiapan. Dokumentasi akan segera dilengkapi setelah kegiatan berlangsung pada 25 Oktober 2026.",
        dokumenLink: "",
        foto: [],
        updatedAt: "2026-10-20T07:00:00Z"
    },

    // ─ Agenda 5: SEDANG DIBUAT
    5: {
        status: "Sedang Dibuat",
        laporan: "Template laporan sudah disiapkan, menunggu pelaksanaan kegiatan.",
        dokumenLink: "",
        foto: [],
        updatedAt: "2026-10-18T14:00:00Z"
    }

    // Agenda 6 (id:6): tidak ada entry → status otomatis "Belum Ada"
};

// Dokumentasi: object dengan agendaId sebagai key
let dokData = readStorage(DOK_KEY);
if (!dokData || typeof dokData !== "object" || Array.isArray(dokData) || Object.keys(dokData).length === 0) {
    dokData = defaultDokData;
    saveDok();
}

function saveDok() { localStorage.setItem(DOK_KEY, JSON.stringify(dokData)); }

/* ── State ───────────────────────────────────────────────── */
let currentView     = "grid";   // grid | list
let deletingId      = null;     // agendaId yang sedang dihapus
let activeFilter    = { search: "", divisi: "", status: "" };

/* ── Summary ─────────────────────────────────────────────── */
function renderSummary() {
    const total    = agendas.length;
    let done = 0, progress = 0, empty = 0;

    agendas.forEach(a => {
        const d = dokData[a.id];
        if (!d || d.status === "Belum Ada") empty++;
        else if (d.status === "Selesai")    done++;
        else                                progress++;
    });

    $("dokStatTotal").textContent    = total;
    $("dokStatDone").textContent     = done;
    $("dokStatProgress").textContent = progress;
    $("dokStatEmpty").textContent    = empty;
}

/* ── Filters ─────────────────────────────────────────────── */
function filteredAgendas() {
    const { search, divisi, status } = activeFilter;
    return agendas.filter(a => {
        const d    = dokData[a.id];
        const dSt  = d?.status || "Belum Ada";
        const q    = search.toLowerCase();
        if (search && !a.name.toLowerCase().includes(q) && !(a.description || "").toLowerCase().includes(q)) return false;
        if (divisi && a.divisi !== divisi) return false;
        if (status && dSt !== status) return false;
        return true;
    });
}

/* ── Status helpers ──────────────────────────────────────── */
function dokStatusClass(st) {
    if (st === "Selesai")      return "dok-status-selesai";
    if (st === "Sedang Dibuat") return "dok-status-sedang";
    return "dok-status-belum";
}

function dokStatusLabel(st) {
    if (st === "Selesai")      return "Terdokumentasi";
    if (st === "Sedang Dibuat") return "Sedang Dibuat";
    return "Belum Ada";
}

/* ── Cover (ambil foto pertama jika ada) ─────────────────── */
function coverHTML(agendaId, placeholderEmoji) {
    const d = dokData[agendaId];
    const photos = d?.foto?.filter(u => u.trim()) || [];
    if (photos.length) {
        return `
            <img src="${esc(photos[0])}" alt="cover" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="dok-card-cover-overlay"></div>
            <div class="dok-card-foto-count">📷 ${photos.length}</div>`;
    }
    return `<div class="dok-cover-placeholder">${placeholderEmoji}</div>`;
}

function tipeEmoji(tipe) {
    const m = { Rapat:"🗣", Kegiatan:"🎯", Pelatihan:"📚", Evaluasi:"📊", Lainnya:"📌" };
    return m[tipe] || "📌";
}

/* ── Render Grid ─────────────────────────────────────────── */
function renderGrid(list) {
    const el = $("dokGridView");
    if (!list.length) {
        el.innerHTML = `<div class="dok-empty">
            <div class="dok-empty-icon">📂</div>
            <strong>Tidak ada agenda ditemukan</strong>
            <p>Coba ubah filter atau kata kunci pencarian.</p>
        </div>`;
        return;
    }

    el.innerHTML = list.map(a => {
        const d   = dokData[a.id];
        const st  = d?.status || "Belum Ada";
        const lap = d?.laporan ? d.laporan.substring(0, 90) + (d.laporan.length > 90 ? "…" : "") : "Belum ada laporan untuk agenda ini.";

        return `<div class="dok-card" id="dok-card-${a.id}" onclick="openDetail(${a.id})">
            <div class="dok-card-cover">
                ${coverHTML(a.id, tipeEmoji(a.tipe))}
            </div>
            <div class="dok-card-body">
                <div class="dok-card-top">
                    <span class="dok-status-badge ${dokStatusClass(st)}">
                        <i></i>${dokStatusLabel(st)}
                    </span>
                    <div class="dok-card-actions">
                        <button onclick="event.stopPropagation(); openDokModal(${a.id})" title="Edit Dokumentasi">✎</button>
                        <button class="delete-btn" onclick="event.stopPropagation(); confirmDokDelete(${a.id})" title="Hapus Dokumentasi">🗑</button>
                    </div>
                </div>
                <div class="dok-card-divisi">${esc(a.divisi)} · ${esc(a.tipe)}</div>
                <h4>${esc(a.name)}</h4>
                <p class="dok-card-snippet">${esc(lap)}</p>
                <div class="dok-card-meta">
                    <div class="dok-card-meta-item"><span>📅</span><span>${formatDate(a.date)}</span></div>
                    <div class="dok-card-meta-item"><span>📍</span><span>${esc(a.location || "-")}</span></div>
                </div>
            </div>
        </div>`;
    }).join("");
}

/* ── Render List ─────────────────────────────────────────── */
function renderList(list) {
    const el = $("dokListView");
    if (!list.length) {
        el.innerHTML = `<div class="dok-empty">
            <div class="dok-empty-icon">📂</div>
            <strong>Tidak ada agenda ditemukan</strong>
            <p>Coba ubah filter atau kata kunci pencarian.</p>
        </div>`;
        return;
    }

    el.innerHTML = list.map(a => {
        const d   = dokData[a.id];
        const st  = d?.status || "Belum Ada";
        const photos = d?.foto?.filter(u => u.trim()) || [];
        const thumb  = photos.length
            ? `<img src="${esc(photos[0])}" alt="thumb" loading="lazy" onerror="this.style.display='none'">`
            : `<div class="dok-foto-placeholder" style="font-size:22px">${tipeEmoji(a.tipe)}</div>`;

        return `<div class="dok-list-item" onclick="openDetail(${a.id})">
            <div class="dok-list-thumb">${thumb}</div>
            <div class="dok-list-body">
                <div class="dok-list-header">
                    <h4>${esc(a.name)}</h4>
                    <span class="dok-status-badge ${dokStatusClass(st)}">
                        <i></i>${dokStatusLabel(st)}
                    </span>
                </div>
                <p>${esc(a.divisi)} · ${esc(a.tipe)} · ${formatDate(a.date)}</p>
                <div class="dok-list-meta">
                    <span>📍 ${esc(a.location || "-")}</span>
                    <span>👤 ${esc(a.pic || "-")}</span>
                    ${photos.length ? `<span>📷 ${photos.length} foto</span>` : ""}
                </div>
            </div>
            <div class="dok-list-actions">
                <button onclick="event.stopPropagation(); openDokModal(${a.id})" title="Edit Dokumentasi">✎</button>
                <button class="delete-btn" onclick="event.stopPropagation(); confirmDokDelete(${a.id})" title="Hapus">🗑</button>
            </div>
        </div>`;
    }).join("");
}

/* ── Master render ───────────────────────────────────────── */
function renderAll() {
    renderSummary();
    const list = filteredAgendas();

    if (currentView === "grid") {
        $("dokGridView").classList.remove("hidden");
        $("dokListView").classList.add("hidden");
        $("btnDokGrid")?.classList.add("active");
        $("btnDokList")?.classList.remove("active");
        renderGrid(list);
    } else {
        $("dokListView").classList.remove("hidden");
        $("dokGridView").classList.add("hidden");
        $("btnDokList")?.classList.add("active");
        $("btnDokGrid")?.classList.remove("active");
        renderList(list);
    }
}

/* ── Foto fields ─────────────────────────────────────────── */
function buildFotoFields(urls = [""]) {
    const container = $("dokFotoFields");
    container.innerHTML = "";
    urls.forEach((url, i) => addFotoRow(url, i));
}

function addFotoRow(url = "", index) {
    const container = $("dokFotoFields");
    const row = document.createElement("div");
    row.className = "dok-foto-row";
    row.innerHTML = `
        <input type="url" placeholder="https://..." value="${esc(url)}" data-foto>
        <button type="button" title="Hapus">×</button>`;
    row.querySelector("button").addEventListener("click", () => row.remove());
    container.appendChild(row);
}

/* ── Modal Edit Dokumentasi ──────────────────────────────── */
function openDokModal(agendaId) {
    const a = agendas.find(x => x.id === agendaId);
    if (!a) return;

    $("dokAgendaId").value       = agendaId;
    $("dokModalTitle").textContent   = "Dokumentasi: " + a.name;
    $("dokModalSubtitle").textContent = a.divisi + " · " + formatDate(a.date);

    const d = dokData[agendaId] || {};
    $("dokStatus").value  = d.status  || "Sedang Dibuat";
    $("dokLaporan").value = d.laporan || "";
    $("dokLink").value    = d.dokumenLink || "";

    const fotos = d.foto?.length ? d.foto : [""];
    buildFotoFields(fotos);

    $("dokModal").classList.add("show");
}

function closeDokModal() { $("dokModal").classList.remove("show"); }

/* ── Detail Modal ────────────────────────────────────────── */
function openDetail(agendaId) {
    const a = agendas.find(x => x.id === agendaId);
    if (!a) return;

    const d      = dokData[agendaId] || {};
    const st     = d.status || "Belum Ada";
    const photos = d.foto?.filter(u => u.trim()) || [];

    /* cover */
    const coverContent = photos.length
        ? `<img src="${esc(photos[0])}" alt="cover" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" onerror="this.style.display='none'">`
        : `<div style="font-size:64px;opacity:.35">${tipeEmoji(a.tipe)}</div>`;

    /* foto gallery */
    const galleryHTML = photos.length
        ? photos.map(url => `
            <div class="dok-foto-item" onclick="openLightbox('${esc(url)}')">
                <img src="${esc(url)}" alt="foto" loading="lazy"
                     onerror="this.parentElement.innerHTML='<div class=\\'dok-foto-placeholder\\'><span style=\\'font-size:20px\\'>🖼️</span><span>Tidak dapat dimuat</span></div>'">
            </div>`).join("")
        : `<div style="font-size:11px;color:#8a94a6;padding:12px 0">Belum ada foto dokumentasi.</div>`;

    /* laporan */
    const laporanHTML = d.laporan
        ? `<div class="dok-detail-laporan-box">${esc(d.laporan)}</div>`
        : `<div class="dok-detail-laporan-box" style="color:#a0a8b5">Belum ada laporan untuk agenda ini.</div>`;

    /* link dokumen */
    const linkHTML = d.dokumenLink
        ? `<a href="${esc(d.dokumenLink)}" target="_blank" rel="noopener noreferrer" class="dok-detail-link">
                📄 Buka Dokumen →
            </a>`
        : `<span style="font-size:11px;color:#a0a8b5">Belum ada link dokumen.</span>`;

    $("dokDetailContent").innerHTML = `
        <div class="dok-detail-cover">${coverContent}</div>

        <div class="dok-detail-header">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                <div>
                    <p class="dok-detail-divisi">${esc(a.divisi)} · ${esc(a.tipe)}</p>
                    <h2 class="dok-detail-title">${esc(a.name)}</h2>
                </div>
                <span class="dok-status-badge ${dokStatusClass(st)}" style="flex-shrink:0;margin-top:4px">
                    <i></i>${dokStatusLabel(st)}
                </span>
            </div>

            <div class="dok-detail-meta-row">
                <div class="dok-detail-meta-pill">📅 ${formatDate(a.date)}</div>
                ${a.time ? `<div class="dok-detail-meta-pill">🕐 ${esc(a.time)} WIB</div>` : ""}
                ${a.location ? `<div class="dok-detail-meta-pill">📍 ${esc(a.location)}</div>` : ""}
                ${a.pic ? `<div class="dok-detail-meta-pill">👤 ${esc(a.pic)}</div>` : ""}
                ${photos.length ? `<div class="dok-detail-meta-pill">📷 ${photos.length} foto</div>` : ""}
            </div>
        </div>

        <!-- Laporan -->
        <div class="dok-detail-section">
            <span class="dok-detail-section-label">Laporan Kegiatan</span>
            ${laporanHTML}
        </div>

        <!-- Foto -->
        <div class="dok-detail-section">
            <span class="dok-detail-section-label">Foto Dokumentasi</span>
            <div class="dok-foto-gallery">${galleryHTML}</div>
        </div>

        <!-- Link -->
        <div class="dok-detail-section">
            <span class="dok-detail-section-label">Dokumen Terkait</span>
            ${linkHTML}
        </div>

        <div class="dok-detail-actions">
            <button class="secondary-button" onclick="closeDokDetail()">Tutup</button>
            <button class="primary-button" onclick="closeDokDetail(); openDokModal(${a.id})">✎ Edit Dokumentasi</button>
        </div>`;

    $("dokDetailModal").classList.add("show");
}

function closeDokDetail() { $("dokDetailModal").classList.remove("show"); }

/* ── Hapus Dokumentasi ───────────────────────────────────── */
function confirmDokDelete(agendaId) {
    const a = agendas.find(x => x.id === agendaId);
    if (!a) return;
    deletingId = agendaId;
    $("dokDeleteMsg").textContent = `Hapus semua dokumentasi untuk agenda "${a.name}"?`;
    $("dokDeleteModal").classList.add("show");
}

function closeDokDelete() {
    $("dokDeleteModal").classList.remove("show");
    deletingId = null;
}

/* ── Lightbox ────────────────────────────────────────────── */
function openLightbox(url) {
    const lb = document.getElementById("dokLightbox");
    lb.querySelector("img").src = url;
    lb.classList.add("show");
}

function closeLightbox() {
    document.getElementById("dokLightbox").classList.remove("show");
}

/* ── Event Listeners ─────────────────────────────────────── */

// View toggle
$("btnDokGrid").addEventListener("click", () => {
    currentView = "grid";
    $("btnDokGrid").classList.add("active");
    $("btnDokList").classList.remove("active");
    renderAll();
});

$("btnDokList").addEventListener("click", () => {
    currentView = "list";
    $("btnDokList").classList.add("active");
    $("btnDokGrid").classList.remove("active");
    renderAll();
});

// Search + Filter
$("dokSearch").addEventListener("input", e => {
    activeFilter.search = e.target.value.trim();
    renderAll();
});

$("dokFilterDivisi").addEventListener("change", e => {
    activeFilter.divisi = e.target.value;
    renderAll();
});

$("dokFilterStatus").addEventListener("change", e => {
    activeFilter.status = e.target.value;
    renderAll();
});

// Modal controls
$("closeDokModal").addEventListener("click", closeDokModal);
$("cancelDok").addEventListener("click",     closeDokModal);
$("dokModal").addEventListener("click", e => { if (e.target === $("dokModal")) closeDokModal(); });

$("closeDokDetail").addEventListener("click", closeDokDetail);
$("dokDetailModal").addEventListener("click", e => { if (e.target === $("dokDetailModal")) closeDokDetail(); });

$("cancelDokDelete").addEventListener("click", closeDokDelete);
$("dokDeleteModal").addEventListener("click", e => { if (e.target === $("dokDeleteModal")) closeDokDelete(); });

// Tambah foto URL field
$("addFotoBtn").addEventListener("click", () => {
    const count = $("dokFotoFields").children.length;
    if (count >= 6) {
        alert("Maksimal 6 foto per dokumentasi.");
        return;
    }
    addFotoRow();
});

// Konfirmasi hapus
$("confirmDokDelete").addEventListener("click", () => {
    if (deletingId !== null) {
        delete dokData[deletingId];
        saveDok();
        renderAll();
    }
    closeDokDelete();
});

// Form submit
$("dokForm").addEventListener("submit", e => {
    e.preventDefault();
    const agendaId = parseInt($("dokAgendaId").value);
    const fotoUrls = [...$("dokFotoFields").querySelectorAll("[data-foto]")]
        .map(inp => inp.value.trim())
        .filter(Boolean);

    dokData[agendaId] = {
        status:      $("dokStatus").value,
        laporan:     $("dokLaporan").value.trim(),
        dokumenLink: $("dokLink").value.trim(),
        foto:        fotoUrls,
        updatedAt:   new Date().toISOString()
    };

    saveDok();
    closeDokModal();
    renderAll();
});

/* ── Lightbox DOM (append dynamically) ───────────────────── */
const lightboxEl = document.createElement("div");
lightboxEl.id = "dokLightbox";
lightboxEl.className = "dok-lightbox";
lightboxEl.innerHTML = `
    <button class="dok-lightbox-close" onclick="closeLightbox()">×</button>
    <img src="" alt="foto besar">`;
lightboxEl.addEventListener("click", e => { if (e.target === lightboxEl) closeLightbox(); });
document.body.appendChild(lightboxEl);

/* ── Expose global functions ─────────────────────────────── */
window.openDokModal    = openDokModal;
window.openDetail      = openDetail;
window.closeDokDetail  = closeDokDetail;
window.confirmDokDelete = confirmDokDelete;
window.openLightbox    = openLightbox;
window.closeLightbox   = closeLightbox;

/* ── Initial render ──────────────────────────────────────── */
renderAll();
