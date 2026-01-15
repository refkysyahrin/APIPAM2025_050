const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi penyimpanan gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

exports.uploadMiddleware = multer({ storage }).single("gambar");

// 1. GET ALL PRODUCTS
exports.getAllProducts = (req, res) => {
  db.query("SELECT * FROM tb_sayur ORDER BY id_sayur DESC", (err, results) => {
    if (err) {
      console.error("Error Get Products:", err);
      return res.status(500).json(err);
    }
    res.status(200).json(results);
  });
};

// 2. CREATE PRODUCT
exports.createProduct = (req, res) => {
  const { id_petani, nama_sayur, harga, stok, deskripsi } = req.body;
  const gambar = req.file ? req.file.filename : null;

  const query =
    "INSERT INTO tb_sayur (id_petani, nama_sayur, harga, stok, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [id_petani, nama_sayur, harga, stok, deskripsi, gambar],
    (err) => {
      if (err) {
        console.error("Error Create Product:", err);
        return res.status(500).json(err);
      }
      res.status(201).json({ message: "Produk ditambahkan" });
    }
  );
};

// 3. UPDATE PRODUCT
exports.updateProduct = (req, res) => {
  const { nama_sayur, harga, stok, deskripsi } = req.body;
  const id = req.params.id;

  let query =
    "UPDATE tb_sayur SET nama_sayur=?, harga=?, stok=?, deskripsi=? WHERE id_sayur=?";
  let values = [nama_sayur, harga, stok, deskripsi, id];

  if (req.file) {
    query =
      "UPDATE tb_sayur SET nama_sayur=?, harga=?, stok=?, deskripsi=?, gambar=? WHERE id_sayur=?";
    values = [nama_sayur, harga, stok, deskripsi, req.file.filename, id];
  }

  db.query(query, values, (err) => {
    if (err) {
      console.error("Error Update Product:", err);
      return res.status(500).json(err);
    }
    res.status(200).json({ message: "Produk diperbarui" });
  });
};

// 4. DELETE PRODUCT
exports.deleteProduct = (req, res) => {
  db.query(
    "DELETE FROM tb_sayur WHERE id_sayur = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.status(200).json({ message: "Produk dihapus" });
    }
  );
};
