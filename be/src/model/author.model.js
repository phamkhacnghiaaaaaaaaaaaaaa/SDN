const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.models.Author || mongoose.model('Author', authorSchema, 'authors');
