const db = require("../config/database");
const multer = require("multer");
const path = require("path");

// Konfigurasi Multer untuk Upload Gambar (REQ-PROD)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    // Memberikan nama file unik berdasarkan timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.uploadMiddleware = multer({ storage: storage }).single("gambar");

// 1. Ambil Semua Produk (Untuk Katalog Pembeli)
exports.getAllProducts = (req, res) => {
  const query = "SELECT * FROM tb_sayur";
  db.query(query, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil data produk", error: err });
    res.status(200).json(results);
  });
};

// 2. Ambil Detail Produk Berdasarkan ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM tb_sayur WHERE id_sayur = ?";
  db.query(query, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil detail produk", error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json(result[0]);
  });
};

// 3. Tambah Produk Baru (Aksi Petani)
exports.createProduct = (req, res) => {
  const { id_petani, nama_sayur, harga, stok, deskripsi } = req.body;
  const gambar = req.file ? req.file.filename : null;

  // Pastikan id_petani dikirim agar tidak melanggar foreign key
  const query =
    "INSERT INTO tb_sayur (id_petani, nama_sayur, harga, stok, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [id_petani, nama_sayur, harga, stok, deskripsi, gambar],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal menambahkan produk", error: err });

      // Mengirim respon sukses agar PetaniViewModel bisa memicu loadProduk()
      res.status(201).json({
        message: "Produk berhasil ditambahkan",
        id_sayur: result.insertId,
      });
    }
  );
};

// 4. Update Produk (Aksi Petani)
exports.updateProduct = (req, res) => {
  const { nama_sayur, harga, stok, deskripsi } = req.body;
  const { id } = req.params;

  let query =
    "UPDATE tb_sayur SET nama_sayur=?, harga=?, stok=?, deskripsi=? WHERE id_sayur=?";
  let params = [nama_sayur, harga, stok, deskripsi, id];

  // Cek jika ada unggahan gambar baru
  if (req.file) {
    query =
      "UPDATE tb_sayur SET nama_sayur=?, harga=?, stok=?, deskripsi=?, gambar=? WHERE id_sayur=?";
    params = [nama_sayur, harga, stok, deskripsi, req.file.filename, id];
  }

  db.query(query, params, (err) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal memperbarui produk", error: err });

    // Respon sukses untuk memicu update katalog di sisi pembeli secara real-time
    res.status(200).json({ message: "Produk berhasil diperbarui" });
  });
};

// 5. Hapus Produk (Aksi Petani)
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tb_sayur WHERE id_sayur = ?", [id], (err) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menghapus produk", error: err });
    res.status(200).json({ message: "Produk berhasil dihapus" });
  });
};
