const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// Add Product
router.post("/add-product", async (req, res) => {
    try {
        const product = new Product(req.body);

        await product.save();

        res.status(201).json({
            message: "Product Added Successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get All Products
router.get("/get-products", async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
 // Delete Product
router.delete("/delete-product/:id", async (req, res) => {

    try {

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});
// Update Product
router.put("/update-product/:id", async (req, res) => {

    try {

        const updatedProduct =
            await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

        res.status(200).json({
            message: "Product Updated Successfully",
            updatedProduct
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});
module.exports = router;