// --- DATABASE SOAL ---
let daftarSoal = [
    { pertanyaan: "1. Apa itu Komputasi Pervasif?", opsi: ["Komputasi di mana-mana", "Hardware kuno", "Bahasa pemrograman"], jawaban: 0 },
    { pertanyaan: "2. Sensor apa yang cocok untuk mendeteksi keberadaan (presence)?", opsi: ["Sensor Suhu", "Motion Sensor / PIR", "Sensor Cahaya"], jawaban: 1 },
    { pertanyaan: "3. Apa kepanjangan dari API?", opsi: ["Application Programming Interface", "Advanced Program Integration", "Automated Process Input"], jawaban: 0 },
    { pertanyaan: "4. Bagaimana cara JavaScript mendeteksi tab disembunyikan?", opsi: ["window.close", "document.hidden", "screen.width"], jawaban: 1 },
    { pertanyaan: "5. Manakah yang termasuk framework JavaScript?", opsi: ["Laravel", "Django", "React"], jawaban: 2 }
];

// --- VARIABEL GLOBAL ---
let waktuTersisa = 60; // Total Waktu Ujian
let timerInterval;

let batasMaksimalPelanggaran = 3; 
let jumlahPelanggaran = 0;
let jumlahAFK = 0;
let totalWaktuAFK = 0;
let afkMulai = 0;

let idleTimeout;
let preAfkTimeout;
let isUjianAktif = false;
let isAFK = false;
let isDiskualifikasi = false;
let sedangDihukum = false;

function gantiHalaman(idHalaman) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(idHalaman).classList.add('active');
}

function acakSoal(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function simpanProgres() {
    if (!isUjianAktif) return;
    let jawabanSementara = {};
    daftarSoal.forEach((soal, indexSoal) => {
        const jawabanUser = document.querySelector(`input[name="soal${indexSoal}"]:checked`);
        if (jawabanUser) jawabanSementara[indexSoal] = jawabanUser.value;
    });

    const dataUjian = {
        waktuTersisa: waktuTersisa,
        jumlahPelanggaran: jumlahPelanggaran,
        jumlahAFK: jumlahAFK,
        totalWaktuAFK: totalWaktuAFK,
        daftarSoal: daftarSoal, 
        jawaban: jawabanSementara
    };
    localStorage.setItem('progresUjian', JSON.stringify(dataUjian));
}

// --- ALUR MULAI UJIAN (VALIDASI INPUT & DATABASE KETAT) ---
function mulaiUjian() {
    const nama = document.getElementById('nama').value.trim();
    const nim = document.getElementById('nim').value.trim();

    // 1. Validasi Input Kosong
    if (nama === "" || nim === "") {
        alert("Nama dan NIM wajib diisi!");
        return;
    }

    // 2. Validasi Nama (Wajib Huruf)
    const regexNama = /^[a-zA-Z\s]+$/;
    if (!regexNama.test(nama)) {
        alert("Format Nama tidak valid! Kolom Nama hanya boleh berisi huruf.");
        return;
    }

    // 3. Validasi NIM (Wajib Angka)
    const regexNIM = /^[0-9]+$/;
    if (!regexNIM.test(nim)) {
        alert("Format NIM tidak valid! Kolom NIM hanya boleh berisi angka.");
        return;
    }

    // ==========================================
    // 4. VERIFIKASI KE DATABASE EXCEL GURU
    // ==========================================
    const dbSiswa = JSON.parse(localStorage.getItem('databasePesertaResmi'));
    
    if (!dbSiswa || dbSiswa.length === 0) {
        alert("🚨 Ujian belum dibuka! Guru belum mengunggah Database Peserta (DPT).");
        return;
    }

    // Pencocokan data
    const siswaDitemukan = dbSiswa.find(
        siswa => siswa.nim === nim && siswa.nama === nama.toLowerCase()
    );

    if (!siswaDitemukan) {
        alert(`❌ AKSES DITOLAK!\nData dengan NIM: ${nim} dan Nama: ${nama} tidak terdaftar di sistem ujian. Pastikan tidak ada salah ketik atau lapor ke pengawas.`);
        return; // Tolak akses jika tidak ada di Excel
    }
    // ==========================================

    document.documentElement.requestFullscreen().catch((err) => {
        console.log("Browser menolak fullscreen otomatis.");
    });

    document.getElementById('hasil-nama').innerText = nama;
    document.getElementById('hasil-nim').innerText = nim;

    const sesiTersimpan = localStorage.getItem('progresUjian');
    let isResume = false;

    if (sesiTersimpan) {
        const konfirmasi = confirm("Sistem menemukan sesi ujian yang belum selesai. Lanjutkan ujian sebelumnya?");
        if (konfirmasi) {
            const data = JSON.parse(sesiTersimpan);
            waktuTersisa = data.waktuTersisa;
            jumlahPelanggaran = data.jumlahPelanggaran;
            jumlahAFK = data.jumlahAFK;
            totalWaktuAFK = data.totalWaktuAFK;
            daftarSoal = data.daftarSoal; 
            isResume = true;
            renderSoal();

            for (let key in data.jawaban) {
                const radio = document.querySelector(`input[name="soal${key}"][value="${data.jawaban[key]}"]`);
                if (radio) radio.checked = true;
            }
        } else {
            localStorage.removeItem('progresUjian');
        }
    }

    if (!isResume) {
        acakSoal(daftarSoal);
        renderSoal();
    }

    gantiHalaman('exam-page');
    isUjianAktif = true;
    document.getElementById('waktu').innerText = waktuTersisa;
    
    jalankanTimer();
    resetIdleTimer();
}

function renderSoal() {
    const container = document.getElementById('soal-container');
    container.innerHTML = '';
    let nomorUrut = 1;
    daftarSoal.forEach((soal, indexSoal) => {
        let teksPertanyaanBersih = soal.pertanyaan.replace(/^\d+\.\s*/, '');
        let htmlSoal = `<div class="soal-item"><p><strong>${nomorUrut}. ${teksPertanyaanBersih}</strong></p>`;
        soal.opsi.forEach((pilihan, indexOpsi) => {
            htmlSoal += `<label><input type="radio" name="soal${indexSoal}" value="${indexOpsi}" onchange="simpanProgres()"> ${pilihan}</label>`;
        });
        htmlSoal += `</div>`;
        container.innerHTML += htmlSoal;
        nomorUrut++;
    });
}

// ------------------------------------------
// SENSOR PERVASIF (AFK & TAB MONITOR)
// ------------------------------------------
document.addEventListener('contextmenu', event => { if (isUjianAktif) event.preventDefault(); });
document.addEventListener('copy', event => { if (isUjianAktif) event.preventDefault(); });
document.addEventListener('cut', event => { if (isUjianAktif) event.preventDefault(); });
document.addEventListener('paste', event => { if (isUjianAktif) event.preventDefault(); });
window.addEventListener('beforeunload', function (e) {
    if (isUjianAktif) { e.preventDefault(); e.returnValue = ''; }
});

function catatPelanggaran(jenis) {
    if (!isUjianAktif || sedangDihukum) return; 
    sedangDihukum = true; 
    jumlahPelanggaran++;
    let sisaNyawa = batasMaksimalPelanggaran - jumlahPelanggaran;

    setTimeout(() => {
        if (jumlahPelanggaran >= batasMaksimalPelanggaran) {
            alert(`🚨 DISKUALIFIKASI! 🚨\nAnda telah melakukan pelanggaran sebanyak ${batasMaksimalPelanggaran} kali (${jenis}). Ujian dihentikan paksa!`);
            isDiskualifikasi = true;
            selesaiUjian(); 
        } else {
            alert(`⚠️ PERINGATAN PELANGGARAN! ⚠️\nAnda terdeteksi ${jenis}.\nSisa kesempatan Anda: ${sisaNyawa} kali lagi sebelum diskualifikasi.`);
            document.getElementById('fullscreen-overlay').classList.add('show');
        }
        setTimeout(() => { sedangDihukum = false; }, 1000);
    }, 100);
}

window.addEventListener('blur', () => { if (isUjianAktif) catatPelanggaran("membuka aplikasi lain atau kehilangan fokus layar"); });
document.addEventListener("visibilitychange", () => { if (isUjianAktif && document.hidden) catatPelanggaran("berpindah tab browser"); });
document.addEventListener('fullscreenchange', () => {
    if (isUjianAktif && !document.fullscreenElement && !isDiskualifikasi) catatPelanggaran("keluar dari mode layar penuh");
});

function kembaliFullscreen() {
    document.documentElement.requestFullscreen().then(() => {
        document.getElementById('fullscreen-overlay').classList.remove('show');
    }).catch(err => { alert("Gagal masuk layar penuh. Silakan coba lagi."); });
}

function jalankanTimer() {
    timerInterval = setInterval(() => {
        if (!isAFK && document.fullscreenElement) { 
            waktuTersisa--;
            document.getElementById('waktu').innerText = waktuTersisa;
            simpanProgres(); 
            if (waktuTersisa <= 0) selesaiUjian();
        }
    }, 1000);
}

function setModeAFK() {
    if (!isUjianAktif || isAFK) return;
    isAFK = true;
    jumlahAFK++;
    afkMulai = Date.now();
    document.getElementById('status-text').innerText = "User is Away From Keyboard";
    document.getElementById('status-text').className = "status-afk";
    document.getElementById('afk-overlay').classList.add('show');
}

function resetIdleTimer() {
    if (!isUjianAktif) return;
    if (isAFK) {
        isAFK = false;
        totalWaktuAFK += Math.floor((Date.now() - afkMulai) / 1000);
        document.getElementById('afk-overlay').classList.remove('show');
    }
    document.getElementById('status-text').innerText = "Aktif";
    document.getElementById('status-text').className = "status-aktif";

    clearTimeout(preAfkTimeout);
    clearTimeout(idleTimeout);

    preAfkTimeout = setTimeout(() => {
        if (isUjianAktif && !isAFK) {
            document.getElementById('status-text').innerText = "Apakah Anda masih di sana?";
            document.getElementById('status-text').className = "status-warning";
        }
    }, 10000); 

    idleTimeout = setTimeout(setModeAFK, 15000); 
}

window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('keydown', resetIdleTimer);
window.addEventListener('scroll', resetIdleTimer); 
window.addEventListener('click', resetIdleTimer);  
window.addEventListener('touchstart', resetIdleTimer); 

// --- ALUR SELESAI UJIAN ---
function selesaiUjian() {
    isUjianAktif = false;
    clearInterval(timerInterval);
    clearTimeout(preAfkTimeout);
    clearTimeout(idleTimeout);

    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }

    let skor = 0;
    let rincianJawaban = [];
    let nomorUrut = 1; 

    daftarSoal.forEach((soal, indexSoal) => {
        const jawabanUser = document.querySelector(`input[name="soal${indexSoal}"]:checked`);
        if (jawabanUser && parseInt(jawabanUser.value) === soal.jawaban) {
            skor += 20;
            rincianJawaban.push(`<strong>${nomorUrut}.</strong> Benar`);
        } else {
            rincianJawaban.push(`<strong>${nomorUrut}.</strong> <span style="color:red;">Salah</span>`);
        }
        nomorUrut++;
    });

    document.getElementById('skor').innerText = skor;

    let statusUjianText = isDiskualifikasi ? "<strong style='color: red;'>DIBATALKAN KARENA PELANGGARAN</strong>" : "<strong>SELESAI NORMAL</strong>";
    let statusSimpan = isDiskualifikasi ? "Diskualifikasi" : "Selesai";

    const logList = document.getElementById('log-list');
    logList.innerHTML = `
        <li>Status Ujian: ${statusUjianText}</li>
        <li>Total Percobaan Curang / Hilang Fokus: <strong>${jumlahPelanggaran} kali</strong></li>
        <li>Jumlah Terdeteksi AFK: <strong>${jumlahAFK} kali</strong></li>
        <li>Total Waktu AFK (Timer Dijeda): <strong>${totalWaktuAFK} detik</strong></li>
    `;

    const namaSiswa = document.getElementById('nama').value;
    const nimSiswa = document.getElementById('nim').value;
    
    const hasilSiswa = {
        nama: namaSiswa,
        nim: nimSiswa,
        skor: skor,
        detail: rincianJawaban.join("<br>"), 
        pelanggaran: jumlahPelanggaran,
        waktuAfk: totalWaktuAFK,
        status: statusSimpan
    };

    let databaseSiswa = JSON.parse(localStorage.getItem('databaseSiswa')) || [];
    databaseSiswa.push(hasilSiswa);
    localStorage.setItem('databaseSiswa', JSON.stringify(databaseSiswa));
    
    localStorage.removeItem('progresUjian');

    gantiHalaman('result-page');
}