const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
    name: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.models.Publisher || mongoose.model('Publisher', publisherSchema, 'publishers');
