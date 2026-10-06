const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    vendor: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Product", ProductSchema);