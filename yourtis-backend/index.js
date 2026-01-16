const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Import Database & Controllers
const db = require("./config/database");
const authController = require("./controllers/authController");
const productController = require("./controllers/productController");
const transactionController = require("./controllers/transactionController");

const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Folder statis untuk akses gambar (PENTING AGAR GAMBAR MUNCUL DI HP)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================

// 1. AUTH ROUTES
app.post("/api/auth/login", authController.login);
app.post("/api/auth/register", authController.register);

// 2. PRODUCT ROUTES (CRUD SAYUR)
app.get("/api/products", productController.getAllProducts);
app.get("/api/products/:id", productController.getProductById); // Detail produk

app.post(
  "/api/products",
  productController.uploadMiddleware,
  productController.createProduct
);

app.put(
  "/api/products/:id",
  productController.uploadMiddleware,
  productController.updateProduct
);

app.delete("/api/products/:id", productController.deleteProduct);

// 3. TRANSACTION ROUTES
// Ambil Semua Transaksi (Dashboard Petani)
app.get("/api/transactions", transactionController.getAllTransactions);

// Ambil Riwayat Per Pembeli (Laporan Pembeli)
app.get(
  "/api/transactions/user/:id_pembeli",
  transactionController.getTransactionsByPembeli
);

// Checkout (Untuk Pembeli)
app.post("/api/transactions/checkout", transactionController.checkout);

// Update Status Transaksi (Petani mengelola pesanan)
app.put("/api/transactions/:id", transactionController.updateStatus);

app.get(
  "/api/transactions/detail/:id",
  transactionController.getTransactionDetail
);

// ==========================================

app.get("/", (req, res) => {
  res.send("Server YourTis Berjalan...");
});

// Menggunakan "0.0.0.0" agar emulator Android bisa akses via IP lokal
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server YourTis running on http://localhost:${PORT}`);
});
