/**
 * Seed script — nạp lại toàn bộ sample data trong ../db vào MongoDB.
 *
 * Cách chạy (từ thư mục be):   node seed.js
 * Hoặc từ gốc dự án:            node be/seed.js
 *
 * Lưu ý: script sẽ XÓA sạch từng collection tương ứng rồi chèn dữ liệu mới.
 */
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const DB_DIR = path.join(__dirname, "..", "db");

// map: file JSON -> tên collection trong Mongo
const FILES = {
    "authors.json": "authors",
    "publishers.json": "publishers",
    "categories.json": "categories",
    "books.json": "books",
    "users.json": "users",
    "rentals.json": "rentals",
    "favourites.json": "favourites",
    "settings.json": "settings",
};

// collection cũ cần dọn (đã bỏ tính năng ebook)
const DROP_COLLECTIONS = ["reading_progress"];

// Chuyển Extended JSON ({$oid}, {$date}) sang kiểu BSON thật
function revive(value) {
    if (Array.isArray(value)) return value.map(revive);
    if (value && typeof value === "object") {
        const keys = Object.keys(value);
        if (keys.length === 1 && keys[0] === "$oid") {
            return new mongoose.Types.ObjectId(value.$oid);
        }
        if (keys.length === 1 && keys[0] === "$date") {
            return new Date(value.$date);
        }
        const out = {};
        for (const k of keys) out[k] = revive(value[k]);
        return out;
    }
    return value;
}

async function run() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("Missing MONGO_URI in be/.env");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

    for (const [file, coll] of Object.entries(FILES)) {
        const filePath = path.join(DB_DIR, file);
        if (!fs.existsSync(filePath)) {
            console.log(`- SKIP  ${file} (không tồn tại)`);
            continue;
        }
        const docs = revive(JSON.parse(fs.readFileSync(filePath, "utf8")));
        await db.collection(coll).deleteMany({});
        if (docs.length) await db.collection(coll).insertMany(docs);
        console.log(`- OK    ${coll.padEnd(12)} ${docs.length} docs`);
    }

    for (const coll of DROP_COLLECTIONS) {
        const exists = await db.listCollections({ name: coll }).hasNext();
        if (exists) {
            await db.collection(coll).drop();
            console.log(`- DROP  ${coll} (đã gỡ)`);
        }
    }

    await mongoose.disconnect();
    console.log("\n✔ Seed hoàn tất.");
}

run().catch((err) => {
    console.error("Seed lỗi:", err.message);
    process.exit(1);
});
