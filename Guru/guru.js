// ==========================================
// 1. FITUR UPLOAD DATABASE PESERTA (CSV)
// ==========================================
document.getElementById('upload-csv').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const baris = text.split('\n');
        let databasePeserta = [];

        // Mulai dari 1 untuk melewati baris Header
        for (let i = 1; i < baris.length; i++) {
            let data = baris[i].split(',');
            if (data.length >= 2) {
                let namaRaw = data[0].trim();
                let nimRaw = data[1].trim();
                
                if (namaRaw && nimRaw) {
                    databasePeserta.push({
                        nama: namaRaw.toLowerCase(), // Simpan huruf kecil agar kebal dari salah format (Case Insensitive)
                        nim: nimRaw
                    });
                }
            }
        }

        localStorage.setItem('databasePesertaResmi', JSON.stringify(databasePeserta));
        document.getElementById('status-db').innerText = `✅ Database berhasil diperbarui! (${databasePeserta.length} siswa terdaftar)`;
        document.getElementById('status-db').style.color = "green";
    };
    reader.readAsText(file);
});

// Cek status database saat halaman dimuat
window.addEventListener('load', () => {
    const dbAda = JSON.parse(localStorage.getItem('databasePesertaResmi'));
    if(dbAda && dbAda.length > 0) {
        document.getElementById('status-db').innerText = `✅ Database Aktif: ${dbAda.length} siswa terdaftar di sistem.`;
        document.getElementById('status-db').style.color = "green";
    } else {
        document.getElementById('status-db').innerText = `⚠️ Database Kosong. Siswa tidak akan bisa login! Harap unggah CSV.`;
        document.getElementById('status-db').style.color = "red";
    }
});

// ==========================================
// 2. FITUR TABEL HASIL UJIAN
// ==========================================
function muatData() {
    const dataSiswa = JSON.parse(localStorage.getItem('databaseSiswa')) || [];
    const tbody = document.getElementById('data-siswa');
    
    tbody.innerHTML = ''; 

    if (dataSiswa.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">Belum ada siswa yang mengerjakan ujian.</td></tr>`;
        return;
    }

    dataSiswa.forEach(siswa => {
        let warnaStatus = siswa.status === "Diskualifikasi" ? "color: red; font-weight: bold;" : "color: green;";
        
        tbody.innerHTML += `
            <tr>
                <td>${siswa.nama}</td>
                <td>${siswa.nim}</td>
                <td style="font-size: 18px;"><strong>${siswa.skor}</strong></td>
                <td style="font-size: 13px; color: #555; text-align: left; line-height: 1.6; padding-left: 20px;">
                    ${siswa.detail}
                </td>
                <td>${siswa.pelanggaran}</td>
                <td>${siswa.waktuAfk} detik</td>
                <td style="${warnaStatus}">${siswa.status}</td>
            </tr>
        `;
    });
}
muatData();

function downloadExcel() {
    const dataSiswa = JSON.parse(localStorage.getItem('databaseSiswa')) || [];
    
    if(dataSiswa.length === 0) {
        alert("Belum ada data untuk diunduh!");
        return;
    }

    let csvContent = "Nama Siswa,NIM,Skor Akhir,Detail Jawaban,Jumlah Pelanggaran,Waktu AFK (Detik),Status Ujian\n";
    
    dataSiswa.forEach(row => {
        let detailBersih = row.detail.replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                                     .replace(/<span style="color:red;">/g, "").replace(/<\/span>/g, "");
        let detailCSV = detailBersih.replace(/<br>/g, "\n");
        
        csvContent += `${row.nama},${row.nim},${row.skor},"${detailCSV}",${row.pelanggaran},${row.waktuAfk},${row.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Rekap_Hasil_Ujian_Pervasif.csv");
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
}

function resetData() {
    const konfirmasi = confirm("Yakin ingin menghapus seluruh riwayat ujian?");
    if (konfirmasi) {
        localStorage.removeItem('databaseSiswa');
        muatData(); 
    }
}