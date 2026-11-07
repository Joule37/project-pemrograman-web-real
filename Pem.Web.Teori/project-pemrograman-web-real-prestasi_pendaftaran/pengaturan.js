
(() => {
    // ==========================================
    // 1. KONFIGURASI
    // ==========================================

    const $ = (id) => document.getElementById(id);

    const SETTINGS_KEY = "fdi_settings";
    const PHOTO_KEY = "fdi_profile_photo";

    const fields = [
        "orgName",
        "orgFull",
        "orgEmail",
        "orgPeriod",
        "orgDescription",
        "adminName",
        "adminRole",
        "adminEmail",
        "notifications",
        "confirmDelete"
    ];

    // ==========================================
    // 2. MEMBACA PENGATURAN
    // ==========================================

    function readSettings() {
        try {
            const data = JSON.parse(
                localStorage.getItem(SETTINGS_KEY) || "{}"
            );

            return data && typeof data === "object" ? data : {};
        } catch (error) {
            console.error("Gagal membaca pengaturan:", error);
            return {};
        }
    }

    const saved = readSettings();

    fields.forEach((id) => {
        const element = $(id);

        if (!element || saved[id] === undefined) return;

        if (element.type === "checkbox") {
            element.checked = !!saved[id];
        } else {
            element.value = saved[id];
        }
    });

    // ==========================================
    // 3. FOTO PROFIL
    // ==========================================

    const photoInput = $("profilePhotoInput");
    const photoPreview = $("profilePhotoPreview");
    const photoInitial = $("profilePhotoInitial");
    const removePhotoButton = $("removeProfilePhoto");

    function getInitials(name) {
        const words = String(name || "Julian Abi")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        return words
            .slice(0, 2)
            .map(word => word.charAt(0).toUpperCase())
            .join("") || "JA";
    }

    function updateAvatarElements(photo, initials) {
        // Avatar pada sidebar dan topbar halaman ini.
        document.querySelectorAll(
            ".user-avatar, .profile-avatar"
        ).forEach((avatar) => {
            if (photo) {
                avatar.innerHTML = "";

                const image = document.createElement("img");
                image.src = photo;
                image.alt = "Foto profil";
                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "cover";
                image.style.borderRadius = "50%";

                avatar.appendChild(image);
            } else {
                avatar.textContent = initials;
            }
        });
    }

    function showProfilePhoto(photo) {
        const initials = getInitials(
            $("adminName")?.value || saved.adminName
        );

        if (photo) {
            photoPreview.innerHTML = "";

            const image = document.createElement("img");
            image.src = photo;
            image.alt = "Preview foto profil";

            photoPreview.appendChild(image);

            if (photoInitial) {
                photoInitial.style.display = "none";
            }
        } else {
            photoPreview.innerHTML = "";

            const span = document.createElement("span");
            span.id = "profilePhotoInitial";
            span.textContent = initials;

            photoPreview.appendChild(span);
        }

        updateAvatarElements(photo, initials);
    }

    // Memuat foto yang sudah tersimpan.
    let currentPhoto = null;

    try {
        currentPhoto = localStorage.getItem(PHOTO_KEY);
    } catch (error) {
        console.error("Gagal membaca foto profil:", error);
    }

    showProfilePhoto(currentPhoto);

    // ==========================================
    // 4. MEMPROSES FOTO DARI KOMPUTER
    // ==========================================

    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const image = new Image();

                image.onload = () => {
                    const canvas = document.createElement("canvas");

                    const maxSize = 512;

                    let width = image.width;
                    let height = image.height;

                    if (width > height && width > maxSize) {
                        height = Math.round(height * maxSize / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round(width * maxSize / height);
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext("2d");

                    context.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    );

                    // Kompres menjadi JPEG agar ukuran lebih kecil.
                    resolve(
                        canvas.toDataURL("image/jpeg", 0.78)
                    );
                };

                image.onerror = () => {
                    reject(new Error("File gambar tidak dapat dibaca."));
                };

                image.src = event.target.result;
            };

            reader.onerror = () => {
                reject(new Error("Gagal membaca file."));
            };

            reader.readAsDataURL(file);
        });
    }

    if (photoInput) {
        photoInput.addEventListener("change", async () => {
            const file = photoInput.files[0];

            if (!file) return;

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {
                alert("Gunakan file JPG, PNG, atau WEBP.");
                photoInput.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran foto maksimal 5 MB.");
                photoInput.value = "";
                return;
            }

            try {
                const compressedPhoto = await compressImage(file);

                // Simpan foto ke localStorage.
                localStorage.setItem(PHOTO_KEY, compressedPhoto);

                currentPhoto = compressedPhoto;

                showProfilePhoto(currentPhoto);

                alert("Foto profil berhasil diperbarui.");
            } catch (error) {
                console.error("Gagal menyimpan foto:", error);

                alert(
                    "Foto gagal disimpan. " +
                    "Penyimpanan browser mungkin sudah penuh."
                );
            }

            photoInput.value = "";
        });
    }

    // ==========================================
    // 5. MENGHAPUS FOTO PROFIL
    // ==========================================

    if (removePhotoButton) {
        removePhotoButton.addEventListener("click", () => {
            if (!currentPhoto) {
                alert("Belum ada foto profil yang digunakan.");
                return;
            }

            const confirmed = confirm(
                "Apakah kamu yakin ingin menghapus foto profil?"
            );

            if (!confirmed) return;

            try {
                localStorage.removeItem(PHOTO_KEY);

                currentPhoto = null;

                showProfilePhoto(null);

                alert("Foto profil berhasil dihapus.");
            } catch (error) {
                console.error("Gagal menghapus foto:", error);
                alert("Foto profil gagal dihapus.");
            }
        });
    }

    // ==========================================
    // 6. MENYIMPAN PENGATURAN
    // ==========================================

    const saveButton = $("saveSettings");

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            const data = {};

            fields.forEach((id) => {
                const element = $(id);

                if (!element) return;

                data[id] = element.type === "checkbox"
                    ? element.checked
                    : element.value.trim();
            });

            try {
                localStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(data)
                );

                alert("Pengaturan berhasil disimpan pada browser ini.");

                // Perbarui inisial avatar jika nama berubah.
                if (!currentPhoto) {
                    showProfilePhoto(null);
                }
            } catch (error) {
                console.error("Gagal menyimpan pengaturan:", error);

                alert("Pengaturan gagal disimpan.");
            }
        });
    }

})();
