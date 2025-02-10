const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
    username: String,
    gold: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    items: { type: Map, of: Number, default: {} }, // Хранение всех предметов
    period: String, // Текущий период (например, "2024-Q1")
});

module.exports = mongoose.model("Stats", statsSchema);
