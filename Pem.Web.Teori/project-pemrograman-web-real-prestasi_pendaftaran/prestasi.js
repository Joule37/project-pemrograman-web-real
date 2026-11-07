
'use strict';

// ==========================================
// KONFIGURASI
// ==========================================

const KEY = 'fdi_prestasi';
const DB_NAME = 'fdi_prestasi_files';
const DB_VERSION = 1;
const STORE_NAME = 'papers';

const $ = id => document.getElementById(id);

let editing = null;
let activePdfUrl = null;

// ==========================================
// DATA PRESTASI DEFAULT
// ==========================================

const defaults = [
    {
        id: 1,
        title: 'Juara 1 Lomba Karya Tulis Ilmiah Tingkat Nasional',
        organizer: 'Universitas Negeri Malang',
        date: '2025-05-12',
        category: 'Akademik',
        level: 'Nasional',
        description: 'Pencapaian anggota FDI dalam kompetisi karya tulis ilmiah.',
        paperUrl: '',
        pdfStored: false
    },
    {
        id: 2,
        title: 'Medali Emas dalam Lomba Inovasi Teknologi',
        organizer: 'Dies Natalis UMM',
        date: '2025-01-28',
        category: 'Non Akademik',
        level: 'Universitas',
        description: 'Inovasi teknologi karya anggota FDI.',
        paperUrl: '',
        pdfStored: false
    },
    {
        id: 3,
        title: 'Juara 2 Business Plan Competition',
        organizer: 'UPN Veteran Jawa Timur',
        date: '2024-10-17',
        category: 'Akademik',
        level: 'Regional',
        description: '',
        paperUrl: '',
        pdfStored: false
    },
    {
        id: 4,
        title: 'Juara Favorit Debat Ilmiah',
        organizer: 'Universitas Brawijaya',
        date: '2024-08-10',
        category: 'Non Akademik',
        level: 'Regional',
        description: '',
        paperUrl: '',
        pdfStored: false
    },
    {
        id: 5,
        title: 'Penghargaan sebagai UKM Berprestasi',
        organizer: 'UMM Awards 2024',
        date: '2024-06-05',
        category: 'Organisasi',
        level: 'Universitas',
        description: '',
        paperUrl: '',
        pdfStored: false
    }
];

// ==========================================
// HELPER
// ==========================================

const esc = value => {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
};

const dateFmt = date => {
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

function safeUrl(value) {
    if (!value) return '';

    try {
        const url = new URL(value);

        if (
            url.protocol === 'https:' ||
            url.protocol === 'http:'
        ) {
            return url.href;
        }
    } catch {
        return '';
    }

    return '';
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function loadAwards() {
    try {
        const savedData = localStorage.getItem(KEY);

        if (savedData === null) {
            localStorage.setItem(KEY, JSON.stringify(defaults));
            return [...defaults];
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData)
            ? parsedData
            : [...defaults];

    } catch (error) {
        console.error('Gagal membaca data prestasi:', error);
        return [...defaults];
    }
}

let awards = loadAwards().map(award => ({
    ...award,
    paperUrl: award.paperUrl || '',
    pdfStored: Boolean(award.pdfStored)
}));

function saveAwards() {
    try {
        localStorage.setItem(KEY, JSON.stringify(awards));
        return true;

    } catch (error) {
        console.error('Gagal menyimpan data prestasi:', error);

        alert(
            'Gagal menyimpan data. Periksa kapasitas penyimpanan browser.'
        );

        return false;
    }
}

// ==========================================
// INDEXEDDB
// ==========================================

function openDatabase() {
    return new Promise((resolve, reject) => {

        if (!window.indexedDB) {
            reject(new Error('Browser tidak mendukung IndexedDB.'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'id'
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}

// ==========================================
// SIMPAN PDF
// ==========================================

async function savePdf(id, file) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_NAME,
            'readwrite'
        );

        transaction.objectStore(STORE_NAME).put({
            id,
            name: file.name,
            type: 'application/pdf',
            blob: file
        });

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };

        transaction.onabort = () => {
            db.close();
            reject(
                transaction.error ||
                new Error('Penyimpanan PDF dibatalkan.')
            );
        };

    });
}

// ==========================================
// AMBIL PDF
// ==========================================

async function getPdf(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_NAME,
            'readonly'
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .get(id);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            db.close();
        };

    });
}

// ==========================================
// HAPUS PDF
// ==========================================

async function deletePdf(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_NAME,
            'readwrite'
        );

        transaction.objectStore(STORE_NAME).delete(id);

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };

        transaction.onabort = () => {
            db.close();
            reject(transaction.error);
        };

    });
}

// ==========================================
// MEMBUAT TAMPILAN PDF VIEWER
// ==========================================

function createPdfViewer() {

    // Cegah pembuatan viewer berulang
    if ($('pdfViewer')) return;

    // Tambahkan CSS otomatis
    const style = document.createElement('style');

    style.id = 'pdfViewerStyles';

    style.textContent = `
        #pdfViewer {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: rgba(15, 23, 42, 0.78);
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .pdf-viewer-container {
            width: min(1100px, 100%);
            height: min(90vh, 900px);
            background: #ffffff;
            border-radius: 13px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }

        .pdf-viewer-header {
            min-height: 58px;
            padding: 0 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border-bottom: 1px solid #e5eaf2;
            background: #ffffff;
        }

        .pdf-viewer-title {
            display: flex;
            flex-direction: column;
            gap: 3px;
            min-width: 0;
        }

        .pdf-viewer-title strong {
            font-size: 13px;
            color: #17233d;
        }

        .pdf-viewer-title span {
            font-size: 10px;
            color: #8792a5;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .pdf-viewer-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .pdf-viewer-controls button {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 7px;
            cursor: pointer;
            background: #f1f4f9;
            color: #475467;
            font-size: 17px;
        }

        .pdf-viewer-controls button:hover {
            background: #e5eaf2;
        }

        #closePdfViewer:hover {
            background: #fee2e2;
            color: #dc2626;
        }

        #pdfFrame {
            width: 100%;
            flex: 1;
            border: 0;
            background: #f1f3f5;
        }

        @media (max-width: 600px) {
            #pdfViewer {
                padding: 7px;
            }

            .pdf-viewer-container {
                height: 96vh;
                border-radius: 9px;
            }

            .pdf-viewer-header {
                padding: 0 10px;
            }

            .pdf-viewer-title strong {
                font-size: 11px;
            }
        }
    `;

    document.head.appendChild(style);

    // Buat elemen viewer
    const viewer = document.createElement('div');

    viewer.id = 'pdfViewer';

    viewer.innerHTML = `
        <div class="pdf-viewer-container">

            <div class="pdf-viewer-header">

                <div class="pdf-viewer-title">
                    <strong>📄 Paper / Karya Ilmiah</strong>
                    <span id="pdfFileName">Dokumen PDF</span>
                </div>

                <div class="pdf-viewer-controls">

                    <button
                        type="button"
                        id="downloadPdf"
                        title="Download PDF"
                    >
                        ↓
                    </button>

                    <button
                        type="button"
                        id="closePdfViewer"
                        title="Tutup PDF"
                    >
                        ✕
                    </button>

                </div>

            </div>

            <iframe
                id="pdfFrame"
                title="PDF Viewer"
            ></iframe>

        </div>
    `;

    document.body.appendChild(viewer);

    // Tombol tutup
    $('closePdfViewer').addEventListener('click', closePdfViewer);

    // Klik area luar viewer untuk menutup
    viewer.addEventListener('click', event => {
        if (event.target === viewer) {
            closePdfViewer();
        }
    });

    // Tombol download
    $('downloadPdf').addEventListener('click', () => {

        if (!activePdfUrl) return;

        const link = document.createElement('a');

        link.href = activePdfUrl;
        link.download = $('pdfFileName').textContent || 'paper.pdf';

        document.body.appendChild(link);
        link.click();
        link.remove();

    });

}

// ==========================================
// MEMBUKA PDF DI DALAM HALAMAN
// ==========================================

async function openPdf(id) {

    try {

        const record = await getPdf(id);

        if (!record || !record.blob) {
            alert('File PDF tidak ditemukan di penyimpanan browser.');
            return;
        }

        // Pastikan viewer tersedia
        createPdfViewer();

        // Bersihkan PDF sebelumnya
        if (activePdfUrl) {
            URL.revokeObjectURL(activePdfUrl);
            activePdfUrl = null;
        }

        // Buat URL PDF
        activePdfUrl = URL.createObjectURL(record.blob);

        // Tampilkan nama file
        $('pdfFileName').textContent = record.name || 'paper.pdf';

        // Tampilkan PDF
        $('pdfFrame').src = activePdfUrl;

        // Buka viewer
        $('pdfViewer').style.display = 'flex';

        document.body.style.overflow = 'hidden';

    } catch (error) {

        console.error('Gagal membuka PDF:', error);

        alert('Gagal membuka file PDF.');

    }

}

// ==========================================
// TUTUP PDF VIEWER
// ==========================================

function closePdfViewer() {

    const viewer = $('pdfViewer');

    if (!viewer) return;

    viewer.style.display = 'none';

    $('pdfFrame').src = 'about:blank';

    document.body.style.overflow = '';

    if (activePdfUrl) {
        URL.revokeObjectURL(activePdfUrl);
        activePdfUrl = null;
    }

}

// Tutup viewer dengan tombol Escape
document.addEventListener('keydown', event => {

    if (event.key === 'Escape' && $('pdfViewer')) {
        closePdfViewer();
    }

});

// ==========================================
// RENDER PRESTASI
// ==========================================

function render() {

    // STATISTIK
    $('totalAwards').textContent = awards.length;

    $('academicAwards').textContent = awards.filter(
        award => award.category === 'Akademik'
    ).length;

    $('nonAcademicAwards').textContent = awards.filter(
        award => award.category === 'Non Akademik'
    ).length;

    // FILTER TAHUN
    const years = [
        ...new Set(
            awards
                .filter(award => award.date)
                .map(award => award.date.slice(0, 4))
        )
    ].sort().reverse();

    const yearSelect = $('awardYear');
    const oldYear = yearSelect.value;

    yearSelect.innerHTML = `
        <option value="all">Semua Tahun</option>

        ${years.map(year => `
            <option value="${esc(year)}">${esc(year)}</option>
        `).join('')}
    `;

    yearSelect.value = years.includes(oldYear)
        ? oldYear
        : 'all';

    // PENCARIAN DAN FILTER
    const search = $('awardSearch').value.toLowerCase().trim();
    const year = yearSelect.value;
    const category = $('awardCategory').value;

    const filteredAwards = awards
        .filter(award => {

            const keyword = (
                award.title + ' ' + award.organizer
            ).toLowerCase();

            return (
                keyword.includes(search) &&
                (year === 'all' || award.date.startsWith(year)) &&
                (category === 'all' || award.category === category)
            );

        })
        .sort((a, b) => b.date.localeCompare(a.date));

    // TAMPILKAN DAFTAR PRESTASI
    $('awardList').innerHTML = filteredAwards.length

        ? filteredAwards.map(award => {

            const driveUrl = safeUrl(award.paperUrl);

            const hasPaper = Boolean(
                award.pdfStored || driveUrl
            );

            return `

                <article class="award-item">

                    <div class="award-medal">
                        ${
                            award.category === 'Akademik'
                                ? '🏆'
                                : award.category === 'Organisasi'
                                    ? '⭐'
                                    : '🥇'
                        }
                    </div>

                    <div class="award-information">

                        <h3>${esc(award.title)}</h3>

                        <p>
                            ${esc(award.organizer)}
                            ·
                            ${esc(award.level)}
                        </p>

                        ${
                            award.description
                                ? `<p>${esc(award.description)}</p>`
                                : ''
                        }

                        <div class="award-actions">

                            <!-- TAMBAH / KELOLA PAPER -->
                            <button
                                type="button"
                                class="mini-btn paper-btn"
                                data-paper-manage="${award.id}"
                            >
                                ${
                                    hasPaper
                                        ? '📁 Kelola Paper'
                                        : '＋ Tambah Paper'
                                }
                            </button>

                            <!-- LIHAT PDF -->
                            ${
                                award.pdfStored
                                    ? `
                                        <button
                                            type="button"
                                            class="mini-btn paper-btn"
                                            data-paper-pdf="${award.id}"
                                        >
                                            📄 Lihat PDF
                                        </button>
                                    `
                                    : ''
                            }

                            <!-- GOOGLE DRIVE -->
                            ${
                                driveUrl
                                    ? `
                                        <a
                                            class="mini-btn paper-btn drive-btn"
                                            href="${esc(driveUrl)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🔗 Google Drive
                                        </a>
                                    `
                                    : ''
                            }

                            <!-- EDIT -->
                            <button
                                type="button"
                                class="mini-btn"
                                data-edit="${award.id}"
                            >
                                Edit
                            </button>

                            <!-- HAPUS -->
                            <button
                                type="button"
                                class="mini-btn"
                                data-delete="${award.id}"
                            >
                                Hapus
                            </button>

                        </div>

                    </div>

                    <div class="award-meta">

                        <span>
                            ▣ ${dateFmt(award.date)}
                        </span>

                        <span class="category-badge ${
                            award.category === 'Non Akademik'
                                ? 'non'
                                : award.category === 'Organisasi'
                                    ? 'org'
                                    : ''
                        }">
                            ${esc(award.category)}
                        </span>

                    </div>

                </article>

            `;

        }).join('')

        : `
            <div class="empty-state">
                Belum ada prestasi yang sesuai dengan pencarian.
            </div>
        `;

}

// ==========================================
// TAMBAH DAN EDIT PRESTASI
// ==========================================

function open(item = null) {

    editing = item?.id ?? null;

    $('awardDialogTitle').textContent = editing
        ? 'Edit Prestasi'
        : 'Tambah Prestasi';

    const form = $('awardForm');

    form.reset();

    // Isi data ketika edit
    if (item) {

        Object.entries(item).forEach(([key, value]) => {

            const field = form.elements.namedItem(key);

            if (
                field &&
                typeof value === 'string' &&
                field.type !== 'file'
            ) {
                field.value = value;
            }

        });

    }

    // Status PDF
    $('paperStatus').textContent = item?.pdfStored
        ? 'PDF sudah tersimpan. Pilih file baru jika ingin menggantinya.'
        : 'Belum ada PDF yang diunggah.';

    // Tampilkan pilihan hapus PDF
    $('removePdfRow').hidden = !item?.pdfStored;

    $('awardDialog').showModal();

}

// Tombol tambah prestasi
$('addAwardBtn').addEventListener('click', () => {
    open();
});

// ==========================================
// PENCARIAN DAN FILTER
// ==========================================

$('awardSearch').addEventListener('input', render);

$('awardYear').addEventListener('change', render);

$('awardCategory').addEventListener('change', render);

// ==========================================
// MENYIMPAN PRESTASI
// ==========================================

$('awardForm').addEventListener('submit', async event => {

    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const file = form.elements.paperFile.files[0];

    const removeExistingPdf = form.elements.removePdf.checked;

    // Ambil data form selain file dan checkbox
    const data = Object.fromEntries(

        [...formData.entries()].filter(([key]) => {

            return ![
                'paperFile',
                'removePdf'
            ].includes(key);

        })

    );

    // VALIDASI LINK GOOGLE DRIVE
    const driveUrl = safeUrl(data.paperUrl);

    if (data.paperUrl && !driveUrl) {

        alert(
            'Link paper harus menggunakan alamat HTTP atau HTTPS yang valid.'
        );

        return;

    }

    data.paperUrl = driveUrl;

    // VALIDASI FILE PDF
    if (file) {

        const isPdf = file.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {

            alert('File yang diunggah harus berformat PDF.');

            form.elements.paperFile.value = '';

            return;

        }

    }

    const existing = awards.find(
        award => award.id === editing
    );

    const id = editing ?? Date.now();

    let pdfStored = existing?.pdfStored || false;

    try {

        // UPLOAD ATAU GANTI PDF
        if (file) {

            await savePdf(id, file);

            pdfStored = true;

        }

        // HAPUS PDF LAMA
        else if (removeExistingPdf && editing) {

            await deletePdf(id);

            pdfStored = false;

        }

        const updatedAward = {
            ...data,
            id,
            pdfStored
        };

        // UPDATE DATA
        if (editing) {

            awards = awards.map(award =>
                award.id === editing
                    ? updatedAward
                    : award
            );

        }

        // TAMBAH DATA
        else {

            awards.push(updatedAward);

        }

        // SIMPAN DATA
        if (!saveAwards()) {
            return;
        }

        $('awardDialog').close();

        render();

    } catch (error) {

        console.error('Gagal menyimpan prestasi:', error);

        alert(
            'Gagal menyimpan data atau PDF. Periksa kapasitas penyimpanan browser.'
        );

    }

});

// ==========================================
// EDIT, HAPUS, DAN KELOLA PAPER
// ==========================================

$('awardList').addEventListener('click', async event => {

    const pdfButton = event.target.closest('[data-paper-pdf]');

    const manageButton = event.target.closest('[data-paper-manage]');

    const editButton = event.target.closest('[data-edit]');

    const deleteButton = event.target.closest('[data-delete]');

    // BUKA PDF
    if (pdfButton) {

        const id = Number(pdfButton.dataset.paperPdf);

        await openPdf(id);

        return;

    }

    // TAMBAH / KELOLA PAPER
    if (manageButton) {

        const id = Number(manageButton.dataset.paperManage);

        const award = awards.find(
            item => item.id === id
        );

        if (award) {
            open(award);
        }

        return;

    }

    // EDIT PRESTASI
    if (editButton) {

        const id = Number(editButton.dataset.edit);

        const award = awards.find(
            item => item.id === id
        );

        if (award) {
            open(award);
        }

        return;

    }

    // HAPUS PRESTASI
    if (deleteButton) {

        const id = Number(deleteButton.dataset.delete);

        const confirmed = confirm(
            'Hapus data prestasi ini beserta file PDF-nya?'
        );

        if (!confirmed) return;

        try {

            await deletePdf(id);

        } catch (error) {

            console.error('Gagal menghapus PDF:', error);

            alert('Gagal menghapus file PDF. Data prestasi tidak dihapus.');

            return;

        }

        awards = awards.filter(
            award => award.id !== id
        );

        if (saveAwards()) {
            render();
        }

    }

});

// ==========================================
// STATUS UPLOAD PDF
// ==========================================

$('paperFile').addEventListener('change', event => {

    const file = event.target.files[0];

    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {

        alert('Pilih file dengan format PDF.');

        event.target.value = '';

        $('paperStatus').textContent = 'Format file PDF.';

        return;

    }

    $('paperStatus').textContent = `File dipilih: ${file.name}`;

});

// ==========================================
// TUTUP DIALOG PRESTASI
// ==========================================

document.querySelectorAll('[data-close]').forEach(button => {

    button.addEventListener('click', () => {

        button.closest('dialog').close();

    });

});

// ==========================================
// INISIALISASI
// ==========================================

render();
