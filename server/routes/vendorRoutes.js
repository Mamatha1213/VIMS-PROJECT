const express = require("express");
const router = express.Router();

const Vendor = require("../models/Vendor");

// Add Vendor
router.post("/add-vendor", async (req, res) => {
    try {
        const vendor = new Vendor(req.body);

        await vendor.save();

        res.status(201).json({
            message: "Vendor Added Successfully",
            vendor
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get All Vendors
router.get("/get-vendors", async (req, res) => {
    try {
        const vendors = await Vendor.find();

        res.status(200).json(vendors);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
// Delete Vendor
router.delete("/delete-vendor/:id", async (req, res) => {

    try {

        await Vendor.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Vendor Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});
// Update Vendor
router.put("/update-vendor/:id", async (req, res) => {

    try {

        const vendor = await Vendor.findByIdAndUpdate(      
            req.params.id,
            req.body,
            { new: true }
        ); 

        res.status(200).json({
            message: "Vendor Updated Successfully",
            vendor
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;