const db = require("../config/database");

const Transaction = {
  // 1. Ambil Semua Transaksi
  getAll: (callback) => {
    const query = "SELECT * FROM tb_transaksi ORDER BY tgl_transaksi DESC";
    db.query(query, callback);
  },

  // 2. Simpan Header Transaksi
  create: (data, callback) => {
    const query = `
            INSERT INTO tb_transaksi (id_transaksi, id_pembeli, total_bayar, metode_kirim, metode_bayar, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        `;
    db.query(
      query,
      [
        data.id_transaksi,
        data.id_pembeli,
        data.total_bayar,
        data.metode_kirim,
        data.metode_bayar,
      ],
      callback
    );
  },

  // 3. Simpan Detail Item (Looping/Bulk Insert)
  createDetail: (values, callback) => {
    const query =
      "INSERT INTO tb_detail_transaksi (id_transaksi, id_sayur, qty, subtotal) VALUES ?";
    db.query(query, [values], callback);
  },

  // 4. Update Stok Sayur
  updateStock: (id_sayur, qty) => {
    const query = "UPDATE tb_sayur SET stok = stok - ? WHERE id_sayur = ?";
    db.query(query, [qty, id_sayur], (err, res) => {
      if (err) console.error("Gagal update stok:", err);
    });
  },
};

module.exports = Transaction;
