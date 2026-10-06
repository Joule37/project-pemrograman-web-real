// ================================
// DASHBOARD STATISTIK
// ================================

document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // DATA ANGGOTA
    // ================================

    const members =
        JSON.parse(localStorage.getItem("fdiMembers")) || [];

    const totalAnggota = members.length;

    const anggotaAktif = members.filter(
        member => member.status === "Aktif"
    ).length;


    // ================================
    // DATA PROGRAM KERJA
    // ================================

    const defaultPrograms = [
        {
            id: 1,
            title: "Rapat Kerja Pengurus",
            division: "Pengurus Inti",
            date: "2026-10-10",
            status: "Berjalan"
        },
        {
            id: 2,
            title: "Upgrading Pengurus",
            division: "PSDM",
            date: "2026-10-18",
            status: "Coming Soon"
        },
        {
            id: 3,
            title: "Media Campaign FDI",
            division: "MENHAS",
            date: "2026-10-22",
            status: "Coming Soon"
        },
        {
            id: 4,
            title: "Forum Diskusi Internal",
            division: "Organisasi",
            date: "2026-10-14",
            status: "Berjalan"
        },
        {
            id: 5,
            title: "Pendampingan PKM",
            division: "PKM",
            date: "2026-10-25",
            status: "Coming Soon"
        },
        {
            id: 6,
            title: "Prediksi LKTI",
            division: "Prediksi",
            date: "2026-11-05",
            status: "Coming Soon"
        }
    ];


    const programs =
        JSON.parse(localStorage.getItem("fdi_program_kerja")) || [];

    const totalProgram = programs.length;


    // ================================
    // KEGIATAN BULAN INI
    // ================================

    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();


    const kegiatanBulanIni = programs.filter(program => {

        if (!program.date) return false;

        const programDate =
            new Date(program.date + "T00:00:00");

        return (
            programDate.getMonth() === currentMonth &&
            programDate.getFullYear() === currentYear
        );

    }).length;


    // ================================
    // TAMPILKAN KE DASHBOARD
    // ================================

    const totalAnggotaElement =
        document.getElementById("totalAnggota");

    const anggotaAktifElement =
        document.getElementById("anggotaAktif");

    const totalProgramElement =
        document.getElementById("totalProgram");

    const kegiatanBulanIniElement =
        document.getElementById("kegiatanBulanIni");


    if (totalAnggotaElement) {
        totalAnggotaElement.textContent = totalAnggota;
    }

    if (anggotaAktifElement) {
        anggotaAktifElement.textContent = anggotaAktif;
    }

    if (totalProgramElement) {
        totalProgramElement.textContent = totalProgram;
    }

    if (kegiatanBulanIniElement) {
        kegiatanBulanIniElement.textContent =
            kegiatanBulanIni;
    }

});