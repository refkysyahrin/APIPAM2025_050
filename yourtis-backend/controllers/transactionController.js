const db = require("../config/database");

// CHECKOUT (Untuk Pembeli membuat pesanan)
exports.checkout = (req, res) => {
  const {
    id_pembeli,
    total_bayar,
    metode_kirim,
    metode_bayar,
    alamat_pengiriman,
    items,
  } = req.body;

  // Memulai Transaksi Database (Atomicity)
  db.beginTransaction((err) => {
    if (err)
      return res.status(500).json({ message: "Gagal memulai transaksi" });

    // 1. Insert ke tb_transaksi (Header) [cite: 327]
    const queryTx =
      "INSERT INTO tb_transaksi (id_pembeli, total_bayar, metode_kirim, metode_bayar, status, alamat_pengiriman) VALUES (?, ?, ?, ?, 'Proses', ?)";

    db.query(
      queryTx,
      [id_pembeli, total_bayar, metode_kirim, metode_bayar, alamat_pengiriman],
      (err, result) => {
        if (err) {
          return db.rollback(() =>
            res
              .status(500)
              .json({ message: "Gagal simpan transaksi", error: err })
          );
        }

        const id_transaksi = result.insertId; // Mengambil ID Auto Increment [cite: 302]

        // 2. Insert ke tb_detail_transaksi (Items) [cite: 341]
        if (items && items.length > 0) {
          const detailValues = items.map((item) => [
            id_transaksi,
            item.id_sayur,
            item.qty,
            item.subtotal,
          ]);
          const queryDetail =
            "INSERT INTO tb_detail_transaksi (id_transaksi, id_sayur, qty, subtotal) VALUES ?";

          db.query(queryDetail, [detailValues], (errD) => {
            if (errD) {
              return db.rollback(() =>
                res
                  .status(500)
                  .json({ message: "Gagal simpan detail", error: errD })
              );
            }

            // 3. Update Stok Sayur Otomatis [cite: 165]
            // (Logika pengurangan stok bisa ditambahkan di sini sesuai kebutuhan SRS REQ-TRX-04)

            db.commit((errC) => {
              if (errC) return db.rollback(() => res.status(500).json(errC));
              res
                .status(201)
                .json({ message: "Pesanan berhasil dibuat", id_transaksi });
            });
          });
        }
      }
    );
  });
};

// GET ALL TRANSACTIONS (Untuk Laporan Petani) [cite: 177]
exports.getAllTransactions = (req, res) => {
  const query = "SELECT * FROM tb_transaksi ORDER BY tgl_transaksi DESC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(results);
  });
};

// UPDATE STATUS [cite: 340]
exports.updateStatus = (req, res) => {
  const { status } = req.body;
  const query = "UPDATE tb_transaksi SET status = ? WHERE id_transaksi = ?";
  db.query(query, [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ message: "Status diperbarui" });
  });
};
