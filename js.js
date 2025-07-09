// Nama Google Sheet Anda
const SHEET_NAME = "Data FitMatch"; 

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log("Sheet not found: " + SHEET_NAME);
    return ContentService.createTextOutput("Error: Sheet not found.");
  }

  // Ambil data dari formulir
  const data = e.parameter;

  // Tangani checkbox (bisa memiliki banyak nilai)
  let morningComplaints = "";
  if (data.morningComplaints) {
    if (Array.isArray(data.morningComplaints)) {
      morningComplaints = data.morningComplaints.join(", ");
    } else {
      morningComplaints = data.morningComplaints;
    }
  }

  // Urutan kolom sesuai dengan header di Google Sheet Anda
  const rowData = [
    data.sleeperCount,
    data.weight,
    data.height,
    data.sleepPosition,
    morningComplaints,
    data.comfortPreference,
    new Date() // Timestamp saat ini
  ];

  // Tambahkan baris baru ke sheet
  sheet.appendRow(rowData);

  // Beri tahu pengguna bahwa pengiriman berhasil
  return ContentService.createTextOutput("Data berhasil dikirim!");
}

// Fungsi doGet diperlukan jika Anda ingin menguji web app dengan GET request,
// tapi untuk pengiriman form POST, doPost yang utama.
function doGet(e) {
  return ContentService.createTextOutput("Akses melalui POST request dari formulir.");
}
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('fitmatchForm');
    const googleSheetURL = "https://script.google.com/macros/s/AKfycbyd3XdX9gkj7ilerVX4FerrLy7hGHru9o9AMuai-w3ve05VJROdvtmSeJAXuFVQcqK9/exec"; // Ganti dengan URL Google Apps Script Anda

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah submit default formulir

        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'morningComplaints') {
                // Tangani multiple checkboxes
                if (!data[key]) {
                    data[key] = [];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Konversi array morningComplaints menjadi string koma terpisah
        if (data.morningComplaints) {
            data.morningComplaints = data.morningComplaints.join(', ');
        }

        // Kirim data ke Google Sheet
        fetch(googleSheetURL, {
            method: 'POST',
            body: new URLSearchParams(data) // Gunakan URLSearchParams untuk form-urlencoded data
        })
        .then(response => response.text())
        .then(result => {
            console.log('Success:', result);
            alert('Data Anda berhasil dikirim! Silakan lanjutkan ke WhatsApp untuk rekomendasi.');

            // Buat pesan WhatsApp
            const sleeperCount = data.sleeperCount || 'Tidak disebutkan';
            const weight = data.weight || 'Tidak disebutkan';
            const height = data.height || 'Tidak disebutkan';
            const sleepPosition = data.sleepPosition || 'Tidak disebutkan';
            const morningComplaints = data.morningComplaints || 'Tidak ada';
            const comfortPreference = data.comfortPreference || 'Tidak yakin';

            const whatsappMessage = `Halo Admin Armadillo FitMatch, saya telah mengisi formulir dengan detail berikut:\n\n` +
                                    `*Jumlah Pengguna:* ${sleeperCount}\n` +
                                    `*Berat Badan:* ${weight}\n` +
                                    `*Tinggi Badan:* ${height} cm\n` +
                                    `*Posisi Tidur Dominan:* ${sleepPosition}\n` +
                                    `*Keluhan saat bangun tidur:* ${morningComplaints}\n` +
                                    `*Preferensi Kenyamanan Kasur:* ${comfortPreference}\n\n` +
                                    `Mohon bantuannya untuk rekomendasi kasur yang cocok.`;

            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappNumber = "6281336069667"; // Ganti dengan nomor WhatsApp admin Anda
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            // Arahkan ke WhatsApp
            window.open(whatsappURL, '_blank');

            // Opsional: Reset formulir setelah pengiriman
            form.reset();
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('Terjadi kesalahan saat mengirim data. Mohon coba lagi.');
        });
    });
});