const db = require("../config/database");

// CHECKOUT dengan Pengurangan Stok Otomatis
exports.checkout = (req, res) => {
  const {
    id_pembeli,
    total_bayar,
    metode_kirim,
    metode_bayar,
    alamat_pengiriman,
    items,
  } = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Gagal transaksi" });

    // 1. Simpan Header Transaksi
    const qTx =
      "INSERT INTO tb_transaksi (id_pembeli, total_bayar, metode_kirim, metode_bayar, status, alamat_pengiriman, tgl_transaksi) VALUES (?, ?, ?, ?, 'Proses', ?, NOW())";
    db.query(
      qTx,
      [id_pembeli, total_bayar, metode_kirim, metode_bayar, alamat_pengiriman],
      (err, result) => {
        if (err) return db.rollback(() => res.status(500).json(err));

        const id_transaksi = result.insertId;
        const detailValues = items.map((i) => [
          id_transaksi,
          i.id_sayur,
          i.qty,
          i.subtotal,
        ]);

        // 2. Simpan Detail Transaksi
        db.query(
          "INSERT INTO tb_detail_transaksi (id_transaksi, id_sayur, qty, subtotal) VALUES ?",
          [detailValues],
          (errD) => {
            if (errD) return db.rollback(() => res.status(500).json(errD));

            // 3. Update Stok Otomatis (REQ-TRX-04)
            const updates = items.map((item) => {
              return new Promise((resolve, reject) => {
                db.query(
                  "UPDATE tb_sayur SET stok = stok - ? WHERE id_sayur = ?",
                  [item.qty, item.id_sayur],
                  (errS) => {
                    if (errS) reject(errS);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(updates)
              .then(() => {
                db.commit((errC) => {
                  if (errC)
                    return db.rollback(() => res.status(500).json(errC));
                  res
                    .status(201)
                    .json({ message: "Pesanan Berhasil", id_transaksi });
                });
              })
              .catch((e) => db.rollback(() => res.status(500).json(e)));
          }
        );
      }
    );
  });
};

// Ambil Riwayat Transaksi Spesifik Pembeli
exports.getTransactionsByPembeli = (req, res) => {
  const { id_pembeli } = req.params;
  const query =
    "SELECT * FROM tb_transaksi WHERE id_pembeli = ? ORDER BY tgl_transaksi DESC";
  db.query(query, [id_pembeli], (err, results) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(results);
  });
};

// Ambil Semua Transaksi untuk Petani
exports.getAllTransactions = (req, res) => {
  db.query(
    "SELECT * FROM tb_transaksi ORDER BY tgl_transaksi DESC",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.status(200).json(results);
    }
  );
};

// Update Status (CRUD Status Petani)
exports.updateStatus = (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE tb_transaksi SET status = ? WHERE id_transaksi = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.status(200).json({ message: "Status diperbarui" });
    }
  );
};

// controllers/transactionController.js

exports.getTransactionDetail = (req, res) => {
  const { id } = req.params;
  // Query untuk mengambil detail item beserta informasi sayurnya
  const query = `
        SELECT dt.*, s.nama_sayur, s.harga, s.gambar 
        FROM tb_detail_transaksi dt
        JOIN tb_sayur s ON dt.id_sayur = s.id_sayur
        WHERE dt.id_transaksi = ?
    `;

  db.query(query, [id], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil detail", error: err });
    res.status(200).json(results);
  });
};
