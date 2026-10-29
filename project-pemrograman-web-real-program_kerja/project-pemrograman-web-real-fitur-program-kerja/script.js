// ================================
// DATA ANGGOTA
// ================================

const defaultMembers = [
    {
        id: 1,
        name: "Julian Abi",
        email: "julian@example.com",
        nim: "202410370311001",
        position: "Ketua Umum",
        division: "Pengurus Inti",
        status: "Aktif"
    },
    {
        id: 2,
        name: "Ahmad Fauzan",
        email: "ahmad@example.com",
        nim: "202410370311002",
        position: "Kepala Divisi",
        division: "PSDM",
        status: "Aktif"
    },
    {
        id: 3,
        name: "Fathur Nabil",
        email: "fathur@example.com",
        nim: "202410370311003",
        position: "Anggota",
        division: "PKM",
        status: "Aktif"
    },
    {
        id: 4,
        name: "Raka Saputra",
        email: "raka@example.com",
        nim: "202410370311004",
        position: "Sekretaris",
        division: "Organisasi",
        status: "Aktif"
    },
    {
        id: 5,
        name: "Nadia Aulia",
        email: "nadia@example.com",
        nim: "202410370311005",
        position: "Anggota",
        division: "MENHAS",
        status: "Tidak Aktif"
    },
    {
        id: 6,
        name: "Farhan Akbar",
        email: "farhan@example.com",
        nim: "202410370311006",
        position: "Anggota",
        division: "Prediksi",
        status: "Aktif"
    }
];


// ================================
// LOCAL STORAGE
// ================================

let members = JSON.parse(localStorage.getItem("fdiMembers"));

if (!members) {
    members = defaultMembers;
    saveMembers();
}

function saveMembers() {
    localStorage.setItem("fdiMembers", JSON.stringify(members));
}


// ================================
// ELEMENT HTML
// ================================

const tableBody = document.querySelector(".member-table tbody");

const searchInput = document.querySelector(
    ".member-search input"
);

const divisionFilter = document.querySelectorAll(
    ".member-filter select"
)[0];

const positionFilter = document.querySelectorAll(
    ".member-filter select"
)[1];

const addButton = document.querySelector(
    ".add-member-button"
);


// ================================
// RENDER DATA
// ================================

function renderMembers() {

    const searchValue = searchInput.value.toLowerCase();

    const selectedDivision = divisionFilter.value;

    const selectedPosition = positionFilter.value;

    const filteredMembers = members.filter(member => {

        const matchSearch =
            member.name.toLowerCase().includes(searchValue) ||
            member.nim.includes(searchValue);

        const matchDivision =
            selectedDivision === "" ||
            member.division === selectedDivision;

        const matchPosition =
            selectedPosition === "" ||
            member.position === selectedPosition;

        return (
            matchSearch &&
            matchDivision &&
            matchPosition
        );
    });


    tableBody.innerHTML = "";


    filteredMembers.forEach((member, index) => {

        const initials = member.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();


        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                ${(index + 1).toString().padStart(2, "0")}
            </td>

            <td>
                <div class="member-name">

                    <div class="member-avatar">
                        ${initials}
                    </div>

                    <div>

                        <strong>
                            ${member.name}
                        </strong>

                        <span>
                            ${member.email}
                        </span>

                    </div>

                </div>
            </td>

            <td>
                ${member.nim}
            </td>

            <td>
                ${member.position}
            </td>

            <td>

                <span class="division-badge blue-badge">
                    ${member.division}
                </span>

            </td>

            <td>

                <span class="status ${
                    member.status === "Aktif"
                        ? "active-status"
                        : "inactive-status"
                }">

                    ${member.status}

                </span>

            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-button"
                        onclick="editMember(${member.id})"
                        title="Edit anggota"
                    >
                        ✎
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteMember(${member.id})"
                        title="Hapus anggota"
                    >
                        🗑
                    </button>

                </div>

            </td>
        `;

        tableBody.appendChild(row);

    });


    updateStatistics(filteredMembers);

    updateTableFooter(filteredMembers.length);
}


// ================================
// UPDATE STATISTIK
// ================================

function updateStatistics() {

    const total = members.length;

    const active = members.filter(
        member => member.status === "Aktif"
    ).length;

    const divisions = new Set(
        members.map(member => member.division)
    ).size;

    const core = members.filter(
        member =>
            member.division === "Pengurus Inti" ||
            member.position === "Ketua Umum" ||
            member.position === "Sekretaris" ||
            member.position === "Bendahara"
    ).length;


    const summaryCards = document.querySelectorAll(
        ".member-summary-card strong"
    );


    if (summaryCards.length >= 4) {

        summaryCards[0].textContent = total;

        summaryCards[1].textContent = active;

        summaryCards[2].textContent = divisions;

        summaryCards[3].textContent = core;

    }
}


// ================================
// TABLE FOOTER
// ================================

function updateTableFooter(count) {

    const footerText = document.querySelector(
        ".table-footer > span"
    );

    if (footerText) {

        footerText.textContent =
            `Menampilkan ${count} dari ${members.length} anggota`;

    }
}


// ================================
// TAMBAH ANGGOTA
// ================================

addButton.addEventListener("click", function () {

    openModal();

});


// ================================
// EDIT ANGGOTA
// ================================

function editMember(id) {

    const member = members.find(
        member => member.id === id
    );

    if (!member) return;

    openModal(member);

}


// ================================
// HAPUS ANGGOTA
// ================================

function deleteMember(id) {

    const member = members.find(
        member => member.id === id
    );

    if (!member) return;


    const confirmation = confirm(
        `Apakah kamu yakin ingin menghapus ${member.name}?`
    );


    if (!confirmation) return;


    members = members.filter(
        member => member.id !== id
    );


    saveMembers();

    renderMembers();

    alert("Data anggota berhasil dihapus.");

}


// ================================
// MODAL
// ================================

function openModal(member = null) {

    const modal = document.getElementById("memberModal");

    const title = document.getElementById("modalTitle");

    const form = document.getElementById("memberForm");


    modal.classList.add("show");


    if (member) {

        title.textContent = "Edit Anggota";

        document.getElementById("memberId").value =
            member.id;

        document.getElementById("memberName").value =
            member.name;

        document.getElementById("memberEmail").value =
            member.email;

        document.getElementById("memberNim").value =
            member.nim;

        document.getElementById("memberPosition").value =
            member.position;

        document.getElementById("memberDivision").value =
            member.division;

        document.getElementById("memberStatus").value =
            member.status;

    } else {

        title.textContent = "Tambah Anggota";

        form.reset();

        document.getElementById("memberId").value = "";

    }

}


// ================================
// TUTUP MODAL
// ================================

function closeModal() {

    document
        .getElementById("memberModal")
        .classList.remove("show");

}


// ================================
// SUBMIT FORM
// ================================

document
    .getElementById("memberForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const id =
            document.getElementById("memberId").value;


        const memberData = {

            id: id
                ? Number(id)
                : Date.now(),

            name:
                document.getElementById("memberName").value,

            email:
                document.getElementById("memberEmail").value,

            nim:
                document.getElementById("memberNim").value,

            position:
                document.getElementById("memberPosition").value,

            division:
                document.getElementById("memberDivision").value,

            status:
                document.getElementById("memberStatus").value

        };


        if (id) {

            // EDIT DATA

            const index = members.findIndex(
                member => member.id === Number(id)
            );

            if (index !== -1) {

                members[index] = memberData;

            }

        } else {

            // TAMBAH DATA

            members.push(memberData);

        }


        saveMembers();

        renderMembers();

        closeModal();


        alert(
            id
                ? "Data anggota berhasil diperbarui."
                : "Anggota berhasil ditambahkan."
        );

    });


// ================================
// SEARCH EVENT
// ================================

searchInput.addEventListener(
    "input",
    renderMembers
);


// ================================
// FILTER EVENT
// ================================

divisionFilter.addEventListener(
    "change",
    renderMembers
);


positionFilter.addEventListener(
    "change",
    renderMembers
);


// ================================
// TUTUP MODAL KLIK LUAR
// ================================

document
    .getElementById("memberModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {

            closeModal();

        }

    });


// ================================
// LOAD DATA AWAL
// ================================

renderMembers();
document.addEventListener('DOMContentLoaded', () => {
    // Menangkap elemen-elemen DOM yang dibutuhkan
    const dataContainer = document.getElementById('data-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-btn');

    // URL API (Contoh menggunakan JSONPlaceholder)
    const apiUrl = 'https://jsonplaceholder.typicode.com/users';

    // Fungsi utama untuk mengambil data dari API
    const fetchData = async () => {
        // 1. Set State: Loading (Tampilkan spinner, sembunyikan error & data lama)
        loadingSpinner.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        dataContainer.classList.add('hidden');
        dataContainer.innerHTML = ''; // Bersihkan data sebelumnya

        try {
            // Proses Fetch ke API
            const response = await fetch(apiUrl);
            
            // Cek jika response bermasalah (misal: 404, 500)
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }

            // 2. Parsing JSON
            const data = await response.json();

            // 3. Set State: Success (Sembunyikan spinner, tampilkan data)
            loadingSpinner.classList.add('hidden');
            dataContainer.classList.remove('hidden');
            
            // Render data ke dalam DOM
            renderData(data);
            
        } catch (error) {
            // 4. Set State: Error (Sembunyikan spinner, tampilkan pesan error & tombol)
            loadingSpinner.classList.add('hidden');
            errorContainer.classList.remove('hidden');
            errorMessage.textContent = `Gagal memuat data: ${error.message}`;
            console.error("API Fetch Error:", error);
        }
    };

    // Fungsi untuk memanipulasi DOM secara dinamis (menampilkan data)
    const renderData = (users) => {
        // Asumsi data adalah array of objects
        users.forEach(user => {
            // Buat elemen card baru
            const card = document.createElement('div');
            card.className = 'card';
            
            // Isi card dengan data dari API
            card.innerHTML = `
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Kota:</strong> ${user.address.city}</p>
                <p><strong>Perusahaan:</strong> ${user.company.name}</p>
            `;
            
            // Masukkan card ke dalam container utama
            dataContainer.appendChild(card);
        });
    };

    // Event Listener untuk Tombol "Coba Lagi"
    retryBtn.addEventListener('click', fetchData);

    // Panggil fungsi fetchData pertama kali saat halaman dimuat
    fetchData();
});

document.addEventListener('DOMContentLoaded', () => {
    // Tangkap elemen DOM Program Kerja
    const progContainer = document.getElementById('prog-data-container');
    const progLoading = document.getElementById('prog-loading');
    const progError = document.getElementById('prog-error');
    const progErrorMsg = document.getElementById('prog-error-msg');
    const progRetryBtn = document.getElementById('prog-retry-btn');

    // URL Backend Lokal Anda
    const progApiUrl = 'http://localhost:3000/api/program-kerja';

    const fetchProgramKerja = async () => {
        // State 1: Loading
        progLoading.classList.remove('hidden');
        progError.classList.add('hidden');
        progContainer.classList.add('hidden');
        progContainer.innerHTML = ''; 

        try {
            const response = await fetch(progApiUrl);
            
            if (!response.ok) {
                throw new Error(`Gagal terhubung: ${response.status}`);
            }

            // State 2: Parsing JSON
            const dataProgram = await response.json();

            // State 3: Success
            progLoading.classList.add('hidden');
            progContainer.classList.remove('hidden');
            
            // Render ke HTML
            renderProgram(dataProgram);
            
        } catch (error) {
            // State 4: Error
            progLoading.classList.add('hidden');
            progError.classList.remove('hidden');
            progErrorMsg.textContent = `Gagal memuat program kerja: ${error.message}`;
        }
    };

    const renderProgram = (programs) => {
        programs.forEach(prog => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Menentukan warna badge berdasarkan status
            const badgeClass = prog.status.toLowerCase() === 'selesai' ? 'selesai' : 'berjalan';
            
            card.innerHTML = `
                <h3>${prog.title}</h3>
                <p><strong>Lokasi:</strong> ${prog.location}</p>
                <p><strong>Tanggal:</strong> ${prog.date}</p>
                <span class="badge ${badgeClass}">${prog.status}</span>
            `;
            
            progContainer.appendChild(card);
        });
    };

    // Tombol coba lagi jika API gagal
    progRetryBtn.addEventListener('click', fetchProgramKerja);

    // Otomatis fetch saat halaman dimuat
    fetchProgramKerja();
});

document.addEventListener('DOMContentLoaded', () => {
    const kegiatanContainer = document.getElementById('kegiatan-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-btn');

    // Karena file json satu folder dengan index.html, kita cukup panggil nama filenya
    const apiUrl = 'data.json'; 

    const fetchKegiatan = async () => {
        // 1. Tampilkan Loading
        loadingSpinner.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        kegiatanContainer.classList.add('hidden');
        kegiatanContainer.innerHTML = ''; 

        try {
            // Simulasi delay jaringan sebentar agar efek loading terlihat
            await new Promise(resolve => setTimeout(resolve, 800));

            // 2. Fetch Data dari data.json
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Gagal memuat data (${response.status})`);
            }

            // 3. Parsing ke JSON
            const data = await response.json();

            // 4. Sukses: Sembunyikan loading, tampilkan grid
            loadingSpinner.classList.add('hidden');
            kegiatanContainer.classList.remove('hidden');
            
            // Render data ke layar
            renderData(data);
            
        } catch (error) {
            // 5. Error Handling
            loadingSpinner.classList.add('hidden');
            errorContainer.classList.remove('hidden');
            errorMessage.textContent = error.message;
        }
    };

    const renderData = (kegiatanData) => {
        kegiatanData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Menentukan warna class status
            const statusClass = item.status === 'Selesai' ? 'status-selesai' : 'status-berjalan';
            
            card.innerHTML = `
                <h3>${item.nama_kegiatan}</h3>
                <p>📍 <strong>Lokasi:</strong> ${item.lokasi}</p>
                <p>🗓️ <strong>Tanggal:</strong> ${item.tanggal}</p>
                
                <div class="badge-container">
                    <span class="badge kategori-badge">${item.kategori}</span>
                    <span class="badge ${statusClass}">${item.status}</span>
                </div>
            `;
            
            kegiatanContainer.appendChild(card);
        });
    };

    // Tombol coba lagi jika ada error
    retryBtn.addEventListener('click', fetchKegiatan);

    // Ambil data pertama kali web dibuka
    fetchKegiatan();
});