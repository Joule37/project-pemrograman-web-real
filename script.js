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