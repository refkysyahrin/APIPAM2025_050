const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- 1. KONFIGURASI MULTER (UPLOAD GAMBAR) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads";
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Format nama file: timestamp-namaasli.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Export Middleware Upload untuk dipakai di Route
exports.uploadMiddleware = upload.single("gambar");

// --- 2. GET ALL PRODUCTS (READ) ---
exports.getAllProducts = (req, res) => {
  const query = "SELECT * FROM tb_sayur ORDER BY id_sayur DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data", error: err });
    }
    res.status(200).json(results);
  });
};

// --- 3. CREATE PRODUCT (INSERT) ---
exports.createProduct = (req, res) => {
  const { id_petani, nama_sayur, harga, stok, deskripsi } = req.body;

  // Validasi Gambar
  if (!req.file) {
    return res.status(400).json({ message: "Gambar wajib diupload" });
  }

  const gambar = req.file.filename;
  // URL agar bisa diakses dari Android (http://ip:port/uploads/namafile.jpg)
  const gambar_url = `${req.protocol}://${req.get("host")}/uploads/${gambar}`;

  const query = `INSERT INTO tb_sayur (id_petani, nama_sayur, harga, stok, deskripsi, gambar, gambar_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    id_petani,
    nama_sayur,
    harga,
    stok,
    deskripsi,
    gambar,
    gambar_url,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal simpan produk", error: err });
    }
    res.status(201).json({ message: "Produk berhasil ditambahkan" });
  });
};

// --- 4. UPDATE PRODUCT (EDIT) - FITUR BARU ---
exports.updateProduct = (req, res) => {
  const id = req.params.id;
  const { nama_sayur, harga, stok, deskripsi } = req.body;

  let query = "";
  let values = [];

  // Cek apakah user mengupload gambar baru?
  if (req.file) {
    // SKENARIO 1: Ada Gambar Baru -> Update semua kolom termasuk gambar
    const gambar = req.file.filename;
    const gambar_url = `${req.protocol}://${req.get("host")}/uploads/${gambar}`;

    query =
      "UPDATE tb_sayur SET nama_sayur=?, harga=?, stok=?, deskripsi=?, gambar=?, gambar_url=? WHERE id_sayur=?";
    values = [nama_sayur, harga, stok, deskripsi, gambar, gambar_url, id];
  } else {
    // SKENARIO 2: Tidak Ada Gambar Baru -> Hanya update data teks, gambar lama tetap
    query =
      "UPDATE tb_sayur SET nama_sayur=?, harga=?, stok=?, deskripsi=? WHERE id_sayur=?";
    values = [nama_sayur, harga, stok, deskripsi, id];
  }

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error update:", err);
      return res
        .status(500)
        .json({ message: "Gagal update produk", error: err });
    }
    res.status(200).json({ message: "Produk berhasil diupdate" });
  });
};

// --- 5. DELETE PRODUCT (HAPUS) ---
exports.deleteProduct = (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM tb_sayur WHERE id_sayur = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal hapus produk", error: err });
    }
    res.status(200).json({ message: "Produk berhasil dihapus" });
  });
};
