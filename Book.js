const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    emoji: { type: String },
    color: { type: String },
    category: { type: String, required: true },
    tag: { type: String },
    stars: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    description: { type: String },
    imageUrl: { type: String },
    isBestseller: { type: Boolean, default: false },
    discountPrice: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
