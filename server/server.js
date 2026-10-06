require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
    
// AI Route
app.use("/api/ai", require("./routes/aiRoutes"));

// Default Route
app.get("/", (req, res) => {
    res.send("Server Running");
});

// Server Port
app.listen(5000, () => {
    console.log("Server running on port 5000");
});