
(() => {
    // ==========================================
    // 1. KONFIGURASI DAN HELPER
    // ==========================================

    const $ = (id) => document.getElementById(id);

    const STORAGE = {
        programs: "fdi_program_kerja",
        members: "fdiMembers",
        agendas: "fdi_agenda_v2",
        achievements: "fdi_prestasi",
        applicants: "fdi_applicants",
        settings: "fdi_settings"
    };

    function read(key, fallback = []) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "null");
            return value ?? fallback;
        } catch (error) {
            console.error("Gagal membaca " + key, error);
            return fallback;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>'"]/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        })[char]);
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value + "T00:00:00");

        if (Number.isNaN(date.getTime())) return "-";

        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    // ==========================================
    // 2. MEMBACA DATA
    // ==========================================

    const programs = read(STORAGE.programs);
    const members = read(STORAGE.members);
    const agendas = read(STORAGE.agendas);
    const achievements = read(STORAGE.achievements);
    const applicants = read(STORAGE.applicants);
    const settings = read(STORAGE.settings, {});

    const safePrograms = Array.isArray(programs) ? programs : [];

    const safeCount = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };

    const organizationName = settings.orgName || "UKM FDI";
    const organizationFull = settings.orgFull || "Forum Diskusi Ilmiah";
    const organizationPeriod = settings.orgPeriod || "Periode Kepengurusan";

    // ==========================================
    // 3. MENGHITUNG STATUS PROGRAM KERJA
    // ==========================================

    const total = safePrograms.length;

    const completed = safePrograms.filter(
        program => program.status === "Selesai"
    ).length;

    const running = safePrograms.filter(
        program => program.status === "Berjalan"
    ).length;

    const pending = safePrograms.filter(
        program => program.status === "Coming Soon"
    ).length;

    // Status lain tetap dihitung sebagai belum selesai.
    const otherStatus = total - completed - running - pending;
    const unfinished = pending + otherStatus;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    // ==========================================
    // 4. MENAMPILKAN STATISTIK UTAMA
    // ==========================================

    $("reportPeriod").textContent =
        "Periode Kepengurusan: " + organizationPeriod;

    $("reportTotal").textContent = total;
    $("reportCompleted").textContent = completed;
    $("reportRunning").textContent = running;
    $("reportPending").textContent = unfinished;

    $("completionPercentage").textContent = percentage + "%";

    $("completionDescription").textContent =
        `${completed} dari ${total} program selesai`;

    $("completionBar").style.width = percentage + "%";

    $("reportMembers").textContent = safeCount(members);
    $("reportAgendas").textContent = safeCount(agendas);
    $("reportAchievements").textContent = safeCount(achievements);
    $("reportApplicants").textContent = safeCount(applicants);

    $("tableTotal").textContent = total + " Program";

    // ==========================================
    // 5. GRAFIK KOMPOSISI STATUS
    // ==========================================

    const statusData = [
        {
            label: "Selesai",
            value: completed,
            color: "#16a34a"
        },
        {
            label: "Berjalan",
            value: running,
            color: "#3b82f6"
        },
        {
            label: "Belum Dimulai",
            value: unfinished,
            color: "#f59e0b"
        }
    ];

    $("statusChart").innerHTML = statusData.map(item => {
        const width = total > 0
            ? (item.value / total) * 100
            : 0;

        return `
            <div class="chart-item">
                <div class="chart-label">
                    <span>
                        <i style="background:${item.color}"></i>
                        ${item.label}
                    </span>
                    <strong>${item.value} program</strong>
                </div>

                <div class="chart-track">
                    <div
                        class="chart-bar"
                        style="width:${width}%; background:${item.color}"
                    ></div>
                </div>
            </div>
        `;
    }).join("");

    // ==========================================
    // 6. STATISTIK BERDASARKAN DIVISI
    // ==========================================

    const divisions = [
        "Pengurus Inti",
        "PSDM",
        "MENHAS",
        "Organisasi",
        "PKM",
        "Prediksi"
    ];

    const divisionData = divisions.map(division => {
        const items = safePrograms.filter(
            program => program.division === division
        );

        const done = items.filter(
            program => program.status === "Selesai"
        ).length;

        const progress = items.length > 0
            ? Math.round((done / items.length) * 100)
            : 0;

        return {
            name: division,
            total: items.length,
            completed: done,
            progress
        };
    });

    $("divisionStatistics").innerHTML = divisionData.map(item => `
        <div class="division-stat-row">
            <div class="division-stat-info">
                <strong>${escapeHTML(item.name)}</strong>
                <span>
                    ${item.completed} dari ${item.total} program selesai
                </span>
            </div>

            <div class="division-stat-progress">
                <div class="division-track">
                    <div
                        class="division-fill"
                        style="width:${item.progress}%"
                    ></div>
                </div>
                <strong>${item.progress}%</strong>
            </div>
        </div>
    `).join("");

    // ==========================================
    // 7. TABEL RINCIAN PROGRAM KERJA
    // ==========================================

    const sortedPrograms = [...safePrograms].sort((a, b) => {
        return String(a.date || "").localeCompare(String(b.date || ""));
    });

    function getStatusClass(status) {
        if (status === "Selesai") return "done";
        if (status === "Berjalan") return "running";
        return "pending";
    }

    function getStatusLabel(status) {
        if (status === "Coming Soon") return "Belum Dimulai";
        return status || "Tidak diketahui";
    }

    $("programTableBody").innerHTML = sortedPrograms.length
        ? sortedPrograms.map(program => `
            <tr>
                <td>
                    <strong>${escapeHTML(program.title)}</strong>
                </td>
                <td>${escapeHTML(program.division || "-")}</td>
                <td>${formatDate(program.date)}</td>
                <td>
                    <span class="report-status ${getStatusClass(program.status)}">
                        ${escapeHTML(getStatusLabel(program.status))}
                    </span>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="4" class="empty-table">
                    Belum ada data program kerja.
                </td>
            </tr>
        `;

    // ==========================================
    // 8. MEMBUAT LAPORAN PDF
    // ==========================================

    function downloadPDF() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert(
                "Library PDF belum berhasil dimuat. " +
                "Periksa koneksi internet lalu coba kembali."
            );
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;

        const today = new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());

        let y = 18;

        // Helper warna
        const colors = {
            navy: [23, 32, 51],
            blue: [21, 94, 239],
            green: [22, 163, 74],
            lightGreen: [220, 252, 231],
            lightBlue: [219, 234, 254],
            orange: [217, 119, 6],
            gray: [102, 112, 133],
            border: [229, 231, 235],
            light: [248, 250, 252]
        };

        function addPageIfNeeded(height) {
            if (y + height > pageHeight - 17) {
                doc.addPage();
                y = 18;
            }
        }

        function drawSectionTitle(title) {
            addPageIfNeeded(13);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...colors.navy);
            doc.text(title, margin, y);

            y += 7;
        }

        // --------------------------------------
        // HEADER PDF
        // --------------------------------------

        doc.setFillColor(...colors.blue);
        doc.roundedRect(margin, y, 13, 13, 2, 2, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("FDI", margin + 3.2, y + 8);

        doc.setTextColor(...colors.navy);
        doc.setFontSize(16);
        doc.text(organizationName, margin + 18, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colors.gray);
        doc.text(organizationFull, margin + 18, y + 10);

        y += 23;

        doc.setDrawColor(...colors.border);
        doc.line(margin, y, pageWidth - margin, y);

        y += 10;

        doc.setTextColor(...colors.navy);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("LAPORAN PERKEMBANGAN PROGRAM KERJA", margin, y);

        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...colors.gray);
        doc.text("Periode: " + organizationPeriod, margin, y);

        y += 5;
        doc.text("Tanggal laporan: " + today, margin, y);

        y += 11;

        // --------------------------------------
        // RINGKASAN STATISTIK
        // --------------------------------------

        drawSectionTitle("1. Ringkasan Statistik");

        const cardGap = 4;
        const cardWidth = (contentWidth - cardGap * 3) / 4;
        const cardHeight = 22;

        const cards = [
            { label: "Total Program", value: total, color: colors.navy },
            { label: "Selesai", value: completed, color: colors.green },
            { label: "Berjalan", value: running, color: colors.blue },
            { label: "Belum Dimulai", value: unfinished, color: colors.orange }
        ];

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + cardGap);

            doc.setFillColor(...colors.light);
            doc.setDrawColor(...colors.border);
            doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(...colors.gray);
            doc.text(card.label, x + 3, y + 7);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(...card.color);
            doc.text(String(card.value), x + 3, y + 17);
        });

        y += cardHeight + 9;

        // --------------------------------------
        // PERSENTASE PENYELESAIAN
        // --------------------------------------

        drawSectionTitle("2. Persentase Penyelesaian");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.setTextColor(...colors.green);
        doc.text(percentage + "%", margin, y + 2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colors.gray);
        doc.text(
            `${completed} dari ${total} program kerja telah selesai`,
            margin + 22,
            y + 2
        );

        y += 9;

        doc.setFillColor(229, 231, 235);
        doc.roundedRect(margin, y, contentWidth, 5, 2, 2, "F");

        if (percentage > 0) {
            doc.setFillColor(...colors.green);
            doc.roundedRect(
                margin,
                y,
                contentWidth * percentage / 100,
                5,
                2,
                2,
                "F"
            );
        }

        y += 13;

        // --------------------------------------
        // GRAFIK KOMPOSISI STATUS
        // --------------------------------------

        drawSectionTitle("3. Komposisi Program Kerja");

        statusData.forEach(item => {
            addPageIfNeeded(13);

            const width = total > 0
                ? (item.value / total) * contentWidth
                : 0;

            const color = item.label === "Selesai"
                ? colors.green
                : item.label === "Berjalan"
                    ? colors.blue
                    : colors.orange;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...colors.navy);
            doc.text(item.label, margin, y + 3);

            doc.setFont("helvetica", "bold");
            doc.text(
                String(item.value),
                pageWidth - margin - 4,
                y + 3,
                { align: "right" }
            );

            y += 5;

            doc.setFillColor(239, 241, 245);
            doc.roundedRect(margin, y, contentWidth, 4, 1, 1, "F");

            if (width > 0) {
                doc.setFillColor(...color);
                doc.roundedRect(margin, y, width, 4, 1, 1, "F");
            }

            y += 8;
        });

        y += 3;

        // --------------------------------------
        // STATISTIK DIVISI
        // --------------------------------------

        drawSectionTitle("4. Perkembangan Program per Divisi");

        divisionData.forEach(item => {
            addPageIfNeeded(14);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...colors.navy);
            doc.text(item.name, margin, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.gray);
            doc.text(
                `${item.completed}/${item.total} selesai (${item.progress}%)`,
                pageWidth - margin,
                y,
                { align: "right" }
            );

            y += 3;

            doc.setFillColor(239, 241, 245);
            doc.roundedRect(margin, y, contentWidth, 3, 1, 1, "F");

            if (item.progress > 0) {
                doc.setFillColor(...colors.green);
                doc.roundedRect(
                    margin,
                    y,
                    contentWidth * item.progress / 100,
                    3,
                    1,
                    1,
                    "F"
                );
            }

            y += 8;
        });

        y += 3;

        // --------------------------------------
        // TABEL RINCIAN PROGRAM
        // --------------------------------------

        drawSectionTitle("5. Rincian Program Kerja");

        const columns = [
            { title: "Nama Program", x: margin, width: 65 },
            { title: "Divisi", x: margin + 67, width: 35 },
            { title: "Tanggal", x: margin + 104, width: 30 },
            { title: "Status", x: margin + 136, width: 44 }
        ];

        function drawTableHeader() {
            doc.setFillColor(...colors.lightBlue);
            doc.rect(margin, y, contentWidth, 9, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colors.navy);

            columns.forEach(column => {
                doc.text(column.title, column.x + 2, y + 6);
            });

            y += 9;
        }

        drawTableHeader();

        if (sortedPrograms.length === 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...colors.gray);
            doc.text("Belum ada program kerja yang tercatat.", margin + 2, y + 7);
            y += 14;
        }

        sortedPrograms.forEach(program => {
            const titleLines = doc.splitTextToSize(
                String(program.title || "-"),
                61
            );

            const divisionLines = doc.splitTextToSize(
                String(program.division || "-"),
                31
            );

            const statusLines = doc.splitTextToSize(
                getStatusLabel(program.status),
                40
            );

            const rowHeight = Math.max(
                10,
                titleLines.length * 4,
                divisionLines.length * 4,
                statusLines.length * 4
            ) + 3;

            if (y + rowHeight > pageHeight - 17) {
                doc.addPage();
                y = 18;
                drawTableHeader();
            }

            doc.setDrawColor(...colors.border);
            doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...colors.navy);

            doc.text(titleLines, columns[0].x + 2, y + 5);
            doc.text(divisionLines, columns[1].x + 2, y + 5);
            doc.text(formatDate(program.date), columns[2].x + 2, y + 5);
            doc.text(statusLines, columns[3].x + 2, y + 5);

            y += rowHeight;
        });

        y += 10;

        // --------------------------------------
        // INFORMASI TAMBAHAN ORGANISASI
        // --------------------------------------

        addPageIfNeeded(35);
        drawSectionTitle("6. Informasi Tambahan Organisasi");

        const additional = [
            ["Total Anggota", safeCount(members)],
            ["Total Agenda", safeCount(agendas)],
            ["Total Prestasi", safeCount(achievements)],
            ["Pendaftar Open Recruitment", safeCount(applicants)]
        ];

        additional.forEach(([label, value]) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...colors.gray);
            doc.text(label, margin, y);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.navy);
            doc.text(String(value), pageWidth - margin, y, {
                align: "right"
            });

            y += 6;
        });

        y += 8;

        // --------------------------------------
        // KESIMPULAN OTOMATIS
        // --------------------------------------

        addPageIfNeeded(30);
        drawSectionTitle("7. Kesimpulan");

        let conclusion;

        if (total === 0) {
            conclusion =
                "Belum terdapat data program kerja. " +
                "Silakan tambahkan program kerja melalui halaman Program Kerja.";
        } else {
            conclusion =
                `Dari total ${total} program kerja, sebanyak ${completed} ` +
                `program (${percentage}%) telah selesai, ${running} program ` +
                `sedang berjalan, dan ${unfinished} program belum dimulai. ` +
                "Data ini dapat digunakan sebagai bahan evaluasi pelaksanaan " +
                "program kerja selama periode kepengurusan.";
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colors.gray);

        const conclusionLines = doc.splitTextToSize(
            conclusion,
            contentWidth
        );

        doc.text(conclusionLines, margin, y);

        y += conclusionLines.length * 5 + 14;

        // --------------------------------------
        // TANDA TANGAN
        // --------------------------------------

        addPageIfNeeded(38);

        const signatureX = pageWidth - margin - 65;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colors.navy);

        doc.text("Mengetahui,", signatureX, y);
        doc.text("Ketua Umum UKM FDI", signatureX, y + 5);

        doc.setFont("helvetica", "bold");
        doc.text(
            settings.adminName || "Julian Abi",
            signatureX,
            y + 29
        );

        doc.setDrawColor(...colors.navy);
        doc.line(signatureX, y + 30, signatureX + 55, y + 30);

        // --------------------------------------
        // NOMOR HALAMAN
        // --------------------------------------

        const pageCount = doc.internal.getNumberOfPages();

        for (let page = 1; page <= pageCount; page++) {
            doc.setPage(page);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);

            doc.text(
                `Laporan UKM FDI | Halaman ${page} dari ${pageCount}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: "center" }
            );
        }

        // Simpan PDF
        doc.save("Laporan-Program-Kerja-UKM-FDI.pdf");
    }

    // ==========================================
    // 9. EVENT TOMBOL PDF
    // ==========================================

    $("downloadPDF").addEventListener("click", downloadPDF);

})();
