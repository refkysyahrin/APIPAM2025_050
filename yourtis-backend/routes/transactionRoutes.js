const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// --- ENDPOINT TRANSAKSI ---

/**
 * 1. PROSES CHECKOUT (POST)
 * Digunakan oleh Pembeli untuk membuat pesanan baru.
 * URL: http://localhost:3000/api/transactions/checkout
 */
router.post("/checkout", transactionController.checkout);

/**
 * 2. GET ALL TRANSACTIONS (GET)
 * Digunakan oleh Petani/Admin untuk melihat seluruh laporan masuk.
 * URL: http://localhost:3000/api/transactions
 */
router.get("/", transactionController.getAllTransactions);

/**
 * 3. UPDATE STATUS PESANAN (PUT)
 * Digunakan Petani untuk mengubah status (misal: 'Proses' ke 'Selesai').
 * URL: http://localhost:3000/api/transactions/:id
 */
router.put("/:id", transactionController.updateStatus);

module.exports = router;
