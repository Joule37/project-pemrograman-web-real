/**
 * dashboard.js — UKM FDI
 * Membaca data dari localStorage (program-kerja & agenda) dan
 * menampilkan statistik real-time di halaman Dashboard.
 */

document.addEventListener("DOMContentLoaded", () => {

    /* ── Utility: baca localStorage dengan aman ──────────────────────────────
       Sama seperti pola di program-kerja.js dan agenda.js:
       bungkus JSON.parse dalam try-catch agar tidak crash jika data korup.
    ─────────────────────────────────────────────────────────────────────── */
    function readStorage(key) {
        try {
            const raw    = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : null;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn(`[Dashboard] Gagal membaca localStorage key "${key}".`, e);
            return [];
        }
    }

    /* ── Ambil data ──────────────────────────────────────────────────────── */
    const members  = readStorage("fdiMembers");          // data anggota
    const programs = readStorage("fdi_program_kerja");   // data program kerja
    const agendas  = readStorage("fdi_agenda_v2");       // data agenda

    const today       = new Date();
    const thisYear    = today.getFullYear();
    const thisMonth   = today.getMonth();   // 0-indexed

    /* ── Hitung statistik Anggota ────────────────────────────────────────── */
    const totalAnggota = members.length;
    const anggotaAktif = members.filter(m => m.status === "Aktif").length;

    /* ── Hitung statistik Program Kerja ─────────────────────────────────── */
    const totalProgram  = programs.length;
    const prokerSelesai = programs.filter(p => p.status === "Selesai").length;
    const prokerBerjalan = programs.filter(p => p.status === "Berjalan").length;

    /* ── Hitung Kegiatan Bulan Ini (dari data Agenda) ────────────────────── 
       Mencakup agenda yang AKTIF (Akan Datang / Berlangsung) pada bulan
       dan tahun kalender yang sedang berjalan saat ini.
    ─────────────────────────────────────────────────────────────────────── */
    const kegiatanBulanIni = agendas.filter(a => {
        if (!a.date) return false;
        const d = new Date(a.date + "T00:00:00");
        return (
            d.getFullYear() === thisYear &&
            d.getMonth()    === thisMonth &&
            a.status !== "Dibatalkan"   // abaikan yang dibatalkan
        );
    }).length;

    /* ── Hitung Agenda Mendatang (untuk subtext kegiatan) ─────────────────── */
    const agendaMingguIni = agendas.filter(a => {
        if (!a.date) return false;
        const d   = new Date(a.date + "T00:00:00");
        const diff = Math.floor((d - today) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7 && a.status !== "Dibatalkan";
    }).length;

    /* ── Tampilkan ke DOM ────────────────────────────────────────────────── */

    // Total Anggota
    const elTotalAnggota = document.getElementById("totalAnggota");
    if (elTotalAnggota) elTotalAnggota.textContent = totalAnggota;

    // Anggota Aktif
    const elAnggotaAktif = document.getElementById("anggotaAktif");
    if (elAnggotaAktif) elAnggotaAktif.textContent = anggotaAktif;

    // Total Program Kerja + update subtext breakdown
    const elTotalProgram = document.getElementById("totalProgram");
    if (elTotalProgram) elTotalProgram.textContent = totalProgram;

    // Update subtext "X selesai · Y berjalan" di stat card Program Kerja
    const elProkerSub = document.getElementById("prokerSubtext");
    if (elProkerSub) {
        elProkerSub.textContent = `${prokerSelesai} selesai · ${prokerBerjalan} berjalan`;
    }

    // Kegiatan Bulan Ini (dari Agenda)
    const elKegiatanBulanIni = document.getElementById("kegiatanBulanIni");
    if (elKegiatanBulanIni) elKegiatanBulanIni.textContent = kegiatanBulanIni;

    // Update subtext "X kegiatan minggu ini"
    const elKegiatanSub = document.getElementById("kegiatanSubtext");
    if (elKegiatanSub) {
        elKegiatanSub.textContent = `${agendaMingguIni} kegiatan minggu ini`;
    }

    /* ── Update Agenda Terdekat di dashboard ─────────────────────────────── 
       Tampilkan 3 agenda terdekat yang belum lewat (Akan Datang / Berlangsung)
       di card "Agenda Terdekat", menggantikan data statis.
    ─────────────────────────────────────────────────────────────────────── */
    const agendaList = document.getElementById("agendaTerdekatList");
    if (agendaList) {
        // Filter agenda mendatang, urutkan dari paling dekat
        const upcoming = agendas
            .filter(a => {
                if (!a.date) return false;
                const d = new Date(a.date + "T00:00:00");
                return d >= new Date(today.toDateString()) && a.status !== "Dibatalkan";
            })
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3);

        if (upcoming.length === 0) {
            agendaList.innerHTML = `
                <div style="text-align:center; padding:20px 0; color:#8a94a6; font-size:11px;">
                    Tidak ada agenda mendatang.
                </div>`;
        } else {
            agendaList.innerHTML = upcoming.map(a => {
                const d   = new Date(a.date + "T00:00:00");
                const day = String(d.getDate()).padStart(2, "0");
                const mon = d.toLocaleDateString("id-ID", { month: "short" })
                             .toUpperCase().replace(".", "");
                const time = a.time ? a.time + " WIB" : "Waktu belum ditentukan";
                const loc  = a.location || "Lokasi belum ditentukan";

                return `<div class="agenda-item">
                    <div class="date-box">
                        <strong>${day}</strong>
                        <span>${mon}</span>
                    </div>
                    <div class="agenda-information">
                        <strong>${escDash(a.name)}</strong>
                        <span>${time} · ${escDash(loc)}</span>
                    </div>
                </div>`;
            }).join("");
        }
    }

    /* ── Tiny escaper untuk innerHTML ────────────────────────────────────── */
    function escDash(v) {
        return String(v ?? "").replace(/[&<>'"]/g, c =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])
        );
    }

});