
'use strict';

// ==========================================
// KONFIGURASI LOCAL STORAGE
// ==========================================

const SETTINGS = 'fdi_recruitment_settings';
const POSITIONS = 'fdi_recruitment_positions';
const APPLICANTS = 'fdi_recruitment_applicants';

// ==========================================
// DAFTAR POSISI UKM FDI
// ==========================================

const allPositions = [
    'Anggota Aktif',
    'Divisi Organisasi',
    'Divisi PKM',
    'Divisi PSDM',
    'Divisi MENHAS',
    'Divisi PREDIKSI'
];

// ==========================================
// HELPER FUNCTION
// ==========================================

const $ = id => document.getElementById(id);

// Mengamankan teks sebelum ditampilkan ke HTML
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[char]));

// Membaca data Local Storage
const read = (key, defaultValue) => {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data ?? defaultValue;
    } catch (error) {
        console.error(`Gagal membaca ${key}:`, error);
        return defaultValue;
    }
};

// Menyimpan data Local Storage
const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Gagal menyimpan ${key}:`, error);
        alert('Gagal menyimpan data. Periksa kapasitas penyimpanan browser.');
        return false;
    }
};

// Format tanggal Indonesia
const fmt = date => {
    if (!date) return '-';

    const parsedDate = new Date(date + 'T00:00:00');

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(parsedDate);
};

// ==========================================
// DATA AWAL
// ==========================================

let settings = read(SETTINGS, {
    start: '2026-11-01',
    end: '2026-11-15',
    quota: 30,
    status: 'open'
});

// ==========================================
// MIGRASI POSISI LAMA
// ==========================================

// Membaca posisi yang pernah disimpan
const savedPositions = read(POSITIONS, null);

// Hanya mempertahankan posisi yang tersedia di daftar baru
let positions = Array.isArray(savedPositions)
    ? savedPositions.filter(position => allPositions.includes(position))
    : [...allPositions];

// Jika data lama berisi posisi yang sudah tidak digunakan,
// aktifkan kembali seluruh posisi baru sebagai pilihan awal.
if (
    Array.isArray(savedPositions) &&
    savedPositions.length > 0 &&
    positions.length === 0
) {
    positions = [...allPositions];
}

// Data contoh pendaftar
let applicants = read(APPLICANTS, [
    {
        id: 1,
        name: 'Nadia Aulia',
        study: 'Informatika',
        position: 'Divisi MENHAS',
        status: 'Menunggu'
    },
    {
        id: 2,
        name: 'Farhan Akbar',
        study: 'Sistem Informasi',
        position: 'Divisi PKM',
        status: 'Diterima'
    }
]);

// ==========================================
// SIMPAN SELURUH DATA
// ==========================================

function save() {
    const successSettings = write(SETTINGS, settings);
    const successPositions = write(POSITIONS, positions);
    const successApplicants = write(APPLICANTS, applicants);

    return successSettings && successPositions && successApplicants;
}

// ==========================================
// RENDER POSISI YANG DIBUKA
// ==========================================

function renderPositions() {
    const positionList = $('positionList');

    if (!positions.length) {
        positionList.innerHTML = `
            <p class="empty-state">
                Belum ada posisi yang dibuka.
            </p>
        `;
        return;
    }

    positionList.innerHTML = positions.map(position => `
        <div class="position-chip">
            <span>✓</span>
            ${esc(position)}
        </div>
    `).join('');
}

// ==========================================
// RENDER DATA PENDAFTAR
// ==========================================

function renderApplicants() {
    const applicantRows = $('applicantRows');

    if (!applicants.length) {
        applicantRows.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    Belum ada pendaftar.
                </td>
            </tr>
        `;
        return;
    }

    applicantRows.innerHTML = applicants.map(applicant => {
        const statusClass = applicant.status === 'Menunggu'
            ? 'pending'
            : applicant.status === 'Diterima'
                ? 'accepted'
                : 'rejected';

        return `
            <tr>
                <td>
                    <strong>${esc(applicant.name)}</strong>
                </td>

                <td>${esc(applicant.study)}</td>

                <td>${esc(applicant.position)}</td>

                <td>
                    <span class="status-pill ${statusClass}">
                        ${esc(applicant.status)}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="row-action"
                        data-toggle="${Number(applicant.id)}"
                    >
                        Ubah status
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// RENDER SEMUA TAMPILAN
// ==========================================

function render() {

    // PERIODE PENDAFTARAN
    const period = settings.start && settings.end
        ? `${fmt(settings.start)} – ${fmt(settings.end)}`
        : 'Belum diatur';

    $('periodText').textContent = period;

    $('periodHint').textContent = 'Periode pendaftaran anggota';

    // STATISTIK PENDAFTAR
    $('applicantCount').textContent = applicants.length;

    // STATUS PENDAFTARAN
    $('recruitStatus').textContent =
        settings.status === 'open' ? 'Dibuka' : 'Ditutup';

    $('quotaText').textContent =
        `Kuota ${settings.quota} anggota`;

    // TAMPILKAN POSISI
    renderPositions();

    // TAMPILKAN PENDAFTAR
    renderApplicants();

    // SIMPAN DATA
    save();
}

// ==========================================
// PENGATURAN OPEN RECRUITMENT
// ==========================================

function openSettings() {
    const form = $('recruitForm');

    form.elements.start.value = settings.start || '';
    form.elements.end.value = settings.end || '';
    form.elements.quota.value = settings.quota || 30;
    form.elements.status.value = settings.status || 'closed';

    $('recruitDialog').showModal();
}

// Tombol Kelola Pendaftaran
$('heroEditBtn').addEventListener('click', openSettings);

// Simpan pengaturan recruitment
$('recruitForm').addEventListener('submit', event => {
    event.preventDefault();

    const form = event.currentTarget;

    const data = Object.fromEntries(
        new FormData(form).entries()
    );

    // Validasi tanggal
    if (data.end < data.start) {
        alert('Tanggal berakhir tidak boleh sebelum tanggal mulai.');
        return;
    }

    // Validasi kuota
    const quota = Number(data.quota);

    if (!Number.isInteger(quota) || quota < 1) {
        alert('Kuota anggota minimal 1.');
        return;
    }

    settings = {
        ...settings,
        start: data.start,
        end: data.end,
        quota,
        status: data.status
    };

    $('recruitDialog').close();

    render();
});

// ==========================================
// MENGELOLA POSISI / DIVISI
// ==========================================

function openPositionSettings() {
    const positionChecks = $('positionChecks');

    positionChecks.innerHTML = allPositions.map((position, index) => `
        <label class="position-option">
            <input
                type="checkbox"
                name="positions"
                value="${esc(position)}"
                ${positions.includes(position) ? 'checked' : ''}
            >

            <span>${esc(position)}</span>
        </label>
    `).join('');

    $('positionDialog').showModal();
}

// Tombol Kelola Posisi
$('managePositions').addEventListener('click', openPositionSettings);

// Simpan posisi yang dipilih
$('positionForm').addEventListener('submit', event => {
    event.preventDefault();

    const checkedPositions = [
        ...$('positionChecks').querySelectorAll('input[name="positions"]:checked')
    ].map(input => input.value);

    // Validasi posisi
    if (checkedPositions.length === 0) {
        const confirmEmpty = confirm(
            'Kamu belum memilih posisi apa pun. Tetap simpan?'
        );

        if (!confirmEmpty) return;
    }

    positions = allPositions.filter(position =>
        checkedPositions.includes(position)
    );

    $('positionDialog').close();

    render();
});

// ==========================================
// MENGELOLA STATUS PENDAFTAR
// ==========================================

$('applicantRows').addEventListener('click', event => {
    const button = event.target.closest('[data-toggle]');

    if (!button) return;

    const applicant = applicants.find(
        item => item.id === Number(button.dataset.toggle)
    );

    if (!applicant) return;

    // Siklus perubahan status
    applicant.status =
        applicant.status === 'Menunggu'
            ? 'Diterima'
            : applicant.status === 'Diterima'
                ? 'Ditolak'
                : 'Menunggu';

    render();
});

// ==========================================
// TUTUP DIALOG
// ==========================================

document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => {
        const dialog = button.closest('dialog');

        if (dialog) {
            dialog.close();
        }
    });
});

// ==========================================
// INISIALISASI
// ==========================================

// Simpan daftar posisi baru
write(POSITIONS, positions);

// Tampilkan halaman
render();
