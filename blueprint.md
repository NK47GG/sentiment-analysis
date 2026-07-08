# Blueprint Aplikasi Analisis Sentimen

## Ikhtisar

Aplikasi ini adalah alat analisis sentimen premium di mana pengguna dapat membeli layanan untuk menganalisis file teks (CSV/Excel). Alur kerja diatur oleh status pesanan yang dikelola antara pengguna dan admin.

## Alur Kerja Pesanan Pengguna

Aplikasi ini berpusat pada halaman dinamis `/payment` yang berubah berdasarkan `status` pesanan pengguna saat ini di database Firestore. Pengguna tetap berada di halaman ini selama proses aktif.

1.  **Tahap 1: Pembayaran (`status: 'pending_payment'`)**
    *   Setelah memilih paket "Premium" di halaman utama, sebuah pesanan dibuat.
    *   Halaman `/payment` menampilkan instruksi pembayaran dan form untuk **mengunggah bukti transfer**.
    *   Setelah bukti diunggah, status pesanan berubah menjadi `payment_uploaded`.

2.  **Tahap 2: Menunggu Verifikasi Admin (`status: 'payment_uploaded'`)**
    *   Halaman `/payment` menampilkan layar tunggu, menginformasikan bahwa pembayaran sedang diverifikasi oleh admin.

3.  **Tahap 3: Unggah Data untuk Analisis (`status: 'payment_verified'`)**
    *   Setelah admin menyetujui pembayaran, status pesanan diperbarui.
    *   Halaman `/payment` sekarang menampilkan form untuk pengguna **mengunggah file data (CSV/Excel)** dan menambahkan **komentar atau instruksi** untuk admin.
    *   Setelah data dikirim, status pesanan berubah menjadi `file_uploaded`.

4.  **Tahap 4: Menunggu Hasil Analisis (`status: 'file_uploaded'`)**
    *   Halaman `/payment` kembali menampilkan layar tunggu, menginformasikan bahwa file sedang dianalisis.

5.  **Tahap 5: Hasil Siap (`status: 'completed'`)**
    *   Admin menyelesaikan analisis dan mengunggah file hasil. Status pesanan diperbarui.
    *   Halaman `/payment` sekarang menampilkan:
        *   Tombol untuk **mengunduh file hasil analisis**.
        *   Tombol **"Done"** untuk konfirmasi pesanan telah diterima dengan baik.
        *   Tombol **"Cek History"** untuk mengarahkan ke riwayat pesanan.

6.  **Tahap 6: Pesanan Selesai (`status: 'done'`)**
    *   Setelah pengguna menekan "Done", status pesanan diperbarui.
    *   Halaman `/payment` menampilkan pesan bahwa transaksi telah selesai dan diarsipkan.
    *   Pengguna dapat memulai pesanan baru dari halaman utama.

7.  **Arsip Pesanan (`/history`)**
    *   Halaman Riwayat berfungsi sebagai arsip untuk semua pesanan yang telah `done` (selesai) atau `completed`.

