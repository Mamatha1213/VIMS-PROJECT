const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

const Product = require("../models/Product");
const Vendor = require("../models/Vendor");

// ============================================================
// GEMINI SETUP
// ============================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

console.log("==========================================");
console.log("VIMS AI COPILOT ROUTE LOADED");
console.log("Gemini model: gemini-3.8-flash");
console.log("==========================================");


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalize(question) {
    return String(question || "")
        .toLowerCase()
        .trim()
        .replace(/[?!.!,]/g, "")
        .replace(/\s+/g, " ");
}


function formatCurrency(value) {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}


function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-IN");
}


function getProductValue(product) {
    return (
        Number(product.quantity || 0) *
        Number(product.price || 0)
    );
}


// ============================================================
// LOAD VIMS DATABASE
// ============================================================

async function loadVimsData() {

    let products = [];
    let vendors = [];

    try {

        products = await Product.find().lean();

    } catch (error) {

        console.error(
            "Product database error:",
            error.message
        );

    }


    try {

        vendors = await Vendor.find().lean();

    } catch (error) {

        console.error(
            "Vendor database error:",
            error.message
        );

    }


    console.log("Products available:", products.length);
    console.log("Vendors available:", vendors.length);

    return {
        products,
        vendors
    };
}


// ============================================================
// DIRECT DATABASE ANSWERS
//
// Gemini is NOT called for these questions.
// ============================================================

function getDatabaseAnswer(question, products, vendors) {

    const q = normalize(question);

    console.log("------------------------------------------");
    console.log("Checking VIMS database question:");
    console.log(q);
    console.log("------------------------------------------");


    // ========================================================
    // WHAT IS VIMS?
    // ========================================================

    if (
        q === "what is vims" ||
        q.includes("what is vims") ||
        q.includes("meaning of vims") ||
        q.includes("define vims")
    ) {

        return `
VIMS stands for Vendor and Inventory Management System.

Your VIMS application helps manage:

• Products
• Inventory stock
• Product prices
• Vendors
• Vendor information
• Inventory value

The VIMS AI Copilot allows you to ask questions about your inventory and vendors using natural language.
        `.trim();
    }


    // ========================================================
    // INVENTORY SUMMARY
    // ========================================================

    if (
        q.includes("inventory summary") ||
        q.includes("stock summary") ||
        q.includes("give me a summary") ||
        q.includes("summarize my inventory") ||
        q.includes("summary of my inventory") ||
        q === "summary"
    ) {

        console.log(">>> DATABASE ANSWER: INVENTORY SUMMARY");
        console.log(">>> Gemini will NOT be called");

        const totalStock =
            products.reduce(
                (total, product) =>
                    total + Number(product.quantity || 0),
                0
            );

        const totalValue =
            products.reduce(
                (total, product) =>
                    total + getProductValue(product),
                0
            );

        const lowStockProducts =
            products.filter((product) => {

                const quantity =
                    Number(product.quantity || 0);

                const minimumStock =
                    Number(product.minimumStock || 0);

                return quantity <= minimumStock;
            });


        return `
📊 VIMS INVENTORY SUMMARY

Products: ${products.length}
Vendors: ${vendors.length}
Total Stock: ${formatNumber(totalStock)} units
Inventory Value: ${formatCurrency(totalValue)}

⚠️ Products needing attention:
${lowStockProducts.length}

Your inventory is currently being managed through VIMS.
        `.trim();
    }


    // ========================================================
    // PRODUCT COUNT
    // ========================================================

    if (
        q.includes("how many products") ||
        q.includes("number of products") ||
        q.includes("total products") ||
        q.includes("product count")
    ) {

        return `
You currently have ${products.length} product${products.length === 1 ? "" : "s"} in your inventory.
        `.trim();
    }


    // ========================================================
    // VENDOR COUNT
    // ========================================================

    if (
        q.includes("how many vendors") ||
        q.includes("number of vendors") ||
        q.includes("total vendors") ||
        q.includes("vendor count")
    ) {

        return `
You currently have ${vendors.length} vendor${vendors.length === 1 ? "" : "s"} registered in VIMS.
        `.trim();
    }


    // ========================================================
    // SHOW / LIST PRODUCTS
    // ========================================================

    if (
        q.includes("show my products") ||
        q.includes("show products") ||
        q.includes("list my products") ||
        q.includes("list products") ||
        q.includes("all products") ||
        q.includes("display products") ||
        q === "products" ||
        q === "product list"
    ) {

        console.log(">>> DATABASE ANSWER: PRODUCTS");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        let answer =
            `📦 YOUR PRODUCTS (${products.length})\n\n`;


        products.forEach((product, index) => {

            answer +=
                `${index + 1}. ${product.productName || "Unnamed Product"}\n`;

            answer +=
                `   Stock: ${formatNumber(product.quantity)} units\n`;

            answer +=
                `   Price: ${formatCurrency(product.price)}\n`;

            answer +=
                `   Inventory Value: ${formatCurrency(getProductValue(product))}\n`;

            answer +=
                `   Vendor: ${product.vendor || "Unknown"}\n`;


            if (product.sku) {

                answer +=
                    `   SKU: ${product.sku}\n`;

            }


            if (product.category) {

                answer +=
                    `   Category: ${product.category}\n`;

            }


            if (product.minimumStock !== undefined) {

                answer +=
                    `   Minimum Stock: ${formatNumber(product.minimumStock)} units\n`;

            }


            answer += "\n";

        });


        return answer.trim();
    }


    // ========================================================
    // SHOW / LIST VENDORS
    // ========================================================

    if (
        q.includes("show my vendors") ||
        q.includes("show vendors") ||
        q.includes("list my vendors") ||
        q.includes("list vendors") ||
        q.includes("all vendors") ||
        q.includes("display vendors") ||
        q === "vendors" ||
        q === "vendor list"
    ) {

        console.log(">>> DATABASE ANSWER: VENDORS");
        console.log(">>> Gemini will NOT be called");

        if (vendors.length === 0) {

            return "There are currently no vendors registered in VIMS.";

        }


        let answer =
            `🏢 YOUR VENDORS (${vendors.length})\n\n`;


        vendors.forEach((vendor, index) => {

            answer +=
                `${index + 1}. ${vendor.name || "Unnamed Vendor"}\n`;


            if (vendor.email) {

                answer +=
                    `   Email: ${vendor.email}\n`;

            }


            if (vendor.phone) {

                answer +=
                    `   Phone: ${vendor.phone}\n`;

            }


            if (vendor.address) {

                answer +=
                    `   Address: ${vendor.address}\n`;

            }


            answer += "\n";

        });


        return answer.trim();
    }


    // ========================================================
    // TOTAL STOCK
    // ========================================================

    if (
        q.includes("total stock") ||
        q.includes("total quantity") ||
        q.includes("total units") ||
        q.includes("how much stock") ||
        q.includes("how many units") ||
        q.includes("how much inventory")
    ) {

        console.log(">>> DATABASE ANSWER: TOTAL STOCK");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        const totalStock =
            products.reduce(
                (total, product) => {

                    return (
                        total +
                        Number(product.quantity || 0)
                    );

                },
                0
            );


        return `
📦 TOTAL INVENTORY STOCK

${formatNumber(totalStock)} units
        `.trim();
    }


    // ========================================================
    // TOTAL INVENTORY VALUE
    // ========================================================

    if (
        q.includes("inventory value") ||
        q.includes("total inventory value") ||
        q.includes("worth of inventory") ||
        q.includes("inventory worth") ||
        q.includes("value of inventory") ||
        q.includes("total stock value") ||
        q.includes("how much is my inventory worth")
    ) {

        console.log(">>> DATABASE ANSWER: INVENTORY VALUE");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        const totalValue =
            products.reduce(
                (total, product) => {

                    return (
                        total +
                        getProductValue(product)
                    );

                },
                0
            );


        return `
💰 TOTAL INVENTORY VALUE

${formatCurrency(totalValue)}
        `.trim();
    }


    // ========================================================
    // PRODUCT WITH HIGHEST INVENTORY VALUE
    // ========================================================

    if (
        q.includes("highest inventory value") ||
        q.includes("most valuable product") ||
        q.includes("highest value product") ||
        q.includes("product worth the most") ||
        q.includes("which product is worth the most")
    ) {

        console.log(">>> DATABASE ANSWER: HIGHEST INVENTORY VALUE");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        const product =
            products.reduce(
                (highest, current) => {

                    if (!highest) {
                        return current;
                    }

                    return getProductValue(current) >
                        getProductValue(highest)
                        ? current
                        : highest;

                },
                null
            );


        return `
🏆 MOST VALUABLE PRODUCT

Product: ${product.productName || "Unknown"}
Stock: ${formatNumber(product.quantity)} units
Price: ${formatCurrency(product.price)}
Inventory Value: ${formatCurrency(getProductValue(product))}
Vendor: ${product.vendor || "Unknown"}
        `.trim();
    }


    // ========================================================
    // LOWEST STOCK
    // ========================================================

    if (
        q.includes("lowest stock") ||
        q.includes("least stock") ||
        q.includes("lowest quantity") ||
        q.includes("least quantity") ||
        q.includes("which product has the lowest") ||
        q.includes("which product has lowest") ||
        q.includes("product with the least stock")
    ) {

        console.log(">>> DATABASE ANSWER: LOWEST STOCK");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        const lowestProduct =
            products.reduce(
                (lowest, product) => {

                    if (!lowest) {
                        return product;
                    }


                    const currentQuantity =
                        Number(product.quantity || 0);

                    const lowestQuantity =
                        Number(lowest.quantity || 0);


                    return currentQuantity < lowestQuantity
                        ? product
                        : lowest;

                },
                null
            );


        return `
📦 PRODUCT WITH THE LOWEST STOCK

Product: ${lowestProduct.productName || "Unknown"}
Stock: ${formatNumber(lowestProduct.quantity)} units
Price: ${formatCurrency(lowestProduct.price)}
Vendor: ${lowestProduct.vendor || "Unknown"}
        `.trim();
    }


    // ========================================================
    // HIGHEST STOCK
    // ========================================================

    if (
        q.includes("highest stock") ||
        q.includes("most stock") ||
        q.includes("highest quantity") ||
        q.includes("most quantity") ||
        q.includes("which product has the highest") ||
        q.includes("which product has highest") ||
        q.includes("product with the most stock")
    ) {

        console.log(">>> DATABASE ANSWER: HIGHEST STOCK");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        const highestProduct =
            products.reduce(
                (highest, product) => {

                    if (!highest) {
                        return product;
                    }


                    const currentQuantity =
                        Number(product.quantity || 0);

                    const highestQuantity =
                        Number(highest.quantity || 0);


                    return currentQuantity > highestQuantity
                        ? product
                        : highest;

                },
                null
            );


        return `
📦 PRODUCT WITH THE HIGHEST STOCK

Product: ${highestProduct.productName || "Unknown"}
Stock: ${formatNumber(highestProduct.quantity)} units
Price: ${formatCurrency(highestProduct.price)}
Vendor: ${highestProduct.vendor || "Unknown"}
        `.trim();
    }


    // ========================================================
    // LOW STOCK / RESTOCKING
    // ========================================================

    if (
        q.includes("low stock") ||
        q.includes("almost out of stock") ||
        q.includes("nearly out of stock") ||
        q.includes("need restocking") ||
        q.includes("needs restocking") ||
        q.includes("products need restocking") ||
        q.includes("which products need restocking") ||
        q.includes("what products need restocking") ||
        q.includes("which products are low")
    ) {

        console.log(">>> DATABASE ANSWER: LOW STOCK");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        const lowStockProducts =
            products.filter((product) => {

                const quantity =
                    Number(product.quantity || 0);

                const minimumStock =
                    Number(product.minimumStock || 0);

                return quantity <= minimumStock;

            });


        if (lowStockProducts.length === 0) {

            return `
✅ STOCK LOOKS GOOD

There are currently no products that need restocking.
            `.trim();

        }


        let answer =
            "🚨 PRODUCTS THAT NEED RESTOCKING\n\n";


        lowStockProducts.forEach(
            (product, index) => {

                const quantity =
                    Number(product.quantity || 0);

                const minimumStock =
                    Number(product.minimumStock || 0);

                const recommendedOrder =
                    Math.max(
                        minimumStock - quantity,
                        0
                    );


                answer +=
                    `${index + 1}. ${product.productName || "Unknown"}\n`;

                answer +=
                    `   Current Stock: ${formatNumber(quantity)} units\n`;

                answer +=
                    `   Minimum Stock: ${formatNumber(minimumStock)} units\n`;

                answer +=
                    `   Recommended Order: ${formatNumber(recommendedOrder)} units\n`;

                answer +=
                    `   Vendor: ${product.vendor || "Unknown"}\n\n`;

            }
        );


        return answer.trim();
    }


    // ========================================================
    // OUT OF STOCK
    // ========================================================

    if (
        q.includes("out of stock") ||
        q.includes("zero stock") ||
        q.includes("no stock") ||
        q.includes("which products are unavailable")
    ) {

        console.log(">>> DATABASE ANSWER: OUT OF STOCK");
        console.log(">>> Gemini will NOT be called");

        const outOfStock =
            products.filter(
                (product) =>
                    Number(product.quantity || 0) <= 0
            );


        if (outOfStock.length === 0) {

            return `
✅ No products are currently out of stock.
            `.trim();

        }


        let answer =
            "🚨 OUT OF STOCK PRODUCTS\n\n";


        outOfStock.forEach(
            (product, index) => {

                answer +=
                    `${index + 1}. ${product.productName || "Unknown"}\n`;

                answer +=
                    `   Vendor: ${product.vendor || "Unknown"}\n`;

                answer +=
                    `   Price: ${formatCurrency(product.price)}\n\n`;

            }
        );


        return answer.trim();
    }


    // ========================================================
    // INVENTORY VALUE PER PRODUCT
    // ========================================================

    if (
        q.includes("value of each product") ||
        q.includes("inventory value of each") ||
        q.includes("stock value of each") ||
        q.includes("value for each product")
    ) {

        console.log(">>> DATABASE ANSWER: PRODUCT VALUES");
        console.log(">>> Gemini will NOT be called");

        if (products.length === 0) {

            return "There are currently no products in your inventory.";

        }


        let answer =
            "💰 INVENTORY VALUE BY PRODUCT\n\n";


        products.forEach(
            (product, index) => {

                answer +=
                    `${index + 1}. ${product.productName || "Unknown"}\n`;

                answer +=
                    `   ${formatNumber(product.quantity)} × ${formatCurrency(product.price)}\n`;

                answer +=
                    `   Value: ${formatCurrency(getProductValue(product))}\n\n`;

            }
        );


        return answer.trim();
    }


    // ========================================================
    // PRODUCT SEARCH BY NAME
    // ========================================================

    for (const product of products) {

        const productName =
            normalize(product.productName);


        if (
            productName &&
            q.includes(productName)
        ) {

            console.log(
                ">>> DATABASE ANSWER: PRODUCT:",
                product.productName
            );

            console.log(
                ">>> Gemini will NOT be called"
            );


            if (
                q.includes("price") ||
                q.includes("cost")
            ) {

                return `
💰 ${product.productName}

Price: ${formatCurrency(product.price)}
Stock: ${formatNumber(product.quantity)} units
Inventory Value: ${formatCurrency(getProductValue(product))}
Vendor: ${product.vendor || "Unknown"}
                `.trim();

            }


            if (
                q.includes("stock") ||
                q.includes("quantity") ||
                q.includes("how many") ||
                q.includes("available")
            ) {

                return `
📦 ${product.productName}

Stock: ${formatNumber(product.quantity)} units
Price: ${formatCurrency(product.price)}
Inventory Value: ${formatCurrency(getProductValue(product))}
Vendor: ${product.vendor || "Unknown"}
                `.trim();

            }


            return `
📦 ${product.productName}

Stock: ${formatNumber(product.quantity)} units
Price: ${formatCurrency(product.price)}
Inventory Value: ${formatCurrency(getProductValue(product))}
Vendor: ${product.vendor || "Unknown"}
            `.trim();
        }
    }


    // ========================================================
    // VENDOR SEARCH BY NAME
    // ========================================================

    for (const vendor of vendors) {

        const vendorName =
            normalize(vendor.name);


        if (
            vendorName &&
            q.includes(vendorName)
        ) {

            console.log(
                ">>> DATABASE ANSWER: VENDOR:",
                vendor.name
            );

            console.log(
                ">>> Gemini will NOT be called"
            );


            return `
🏢 ${vendor.name}

Email: ${vendor.email || "Not available"}
Phone: ${vendor.phone || "Not available"}
Address: ${vendor.address || "Not available"}
            `.trim();
        }
    }


    // ========================================================
    // NO DATABASE ANSWER
    // ========================================================

    console.log(">>> No direct database answer found.");
    console.log(">>> Gemini may be used.");

    return null;
}


// ============================================================
// GEMINI ANSWER
// ============================================================

async function getGeminiAnswer(
    question,
    history,
    products,
    vendors
) {

    console.log("------------------------------------------");
    console.log("Calling Gemini for general AI question...");
    console.log("------------------------------------------");


    const productData =
        products.map((product) => ({

            productName:
                product.productName || "",

            sku:
                product.sku || "",

            category:
                product.category || "General",

            quantity:
                Number(product.quantity || 0),

            minimumStock:
                Number(product.minimumStock || 0),

            price:
                Number(product.price || 0),

            vendor:
                product.vendor || "Unknown"

        }));


    const vendorData =
        vendors.map((vendor) => ({

            name:
                vendor.name || "",

            email:
                vendor.email || "",

            phone:
                vendor.phone || "",

            address:
                vendor.address || ""

        }));


    let conversationText =
        "No previous conversation.";


    if (
        Array.isArray(history) &&
        history.length > 0
    ) {

        conversationText =
            history
                .slice(-10)
                .map((item) => {

                    const role =
                        item.role === "user"
                            ? "User"
                            : "VIMS AI";

                    return (
                        `${role}: ${item.text || ""}`
                    );

                })
                .join("\n");

    }


    const prompt = `

You are VIMS AI Copilot.

VIMS means Vendor and Inventory Management System.

You are the intelligent assistant inside a VIMS application.

You can answer questions about:

• Inventory management
• Vendor management
• Stock management
• Purchasing
• Inventory concepts
• Products
• Vendors
• VIMS
• Business concepts
• General questions

You have access to the current VIMS database data below.

============================================================
CURRENT PRODUCTS
============================================================

${JSON.stringify(productData, null, 2)}

============================================================
CURRENT VENDORS
============================================================

${JSON.stringify(vendorData, null, 2)}

============================================================
PREVIOUS CONVERSATION
============================================================

${conversationText}

============================================================
CURRENT USER QUESTION
============================================================

${question}

============================================================
IMPORTANT RULES
============================================================

1. Answer the user's actual question.

2. Be natural and conversational.

3. Use previous conversation to understand follow-up questions.

4. For general questions, use your knowledge.

5. For VIMS questions, explain clearly.

6. If the question concerns the user's actual products,
   stock, prices or vendors, use the database data supplied above.

7. Never invent database information.

8. Never claim that a database record was changed unless
   the application actually changed it.

9. Use Indian Rupees (₹) for prices.

10. Keep answers clear and useful.

11. If database information is unavailable, say so honestly.

Answer the user now.
`;


    const response =
        await ai.models.generateContent({

            model: "gemini-3.8-flash",

            contents: prompt

        });


    const answer =
        response?.text ||
        response?.candidates?.[0]
            ?.content?.parts?.[0]?.text ||
        "I could not generate an answer.";


    console.log("==========================================");
    console.log("GEMINI ANSWER RECEIVED");
    console.log("==========================================");


    return answer.trim();
}


// ============================================================
// MAIN CHAT ROUTE
// ============================================================

router.post("/chat", async (req, res) => {

    try {

        const {
            message,
            history = []
        } = req.body;


        console.log("");
        console.log("==========================================");
        console.log("VIMS AI REQUEST");
        console.log("Question:", message);
        console.log("==========================================");


        // ----------------------------------------------------
        // VALIDATE MESSAGE
        // ----------------------------------------------------

        if (
            !message ||
            !String(message).trim()
        ) {

            return res.status(400).json({

                error:
                    "Please enter a question."

            });

        }


        const userMessage =
            String(message).trim();


        // ----------------------------------------------------
        // LOAD DATABASE
        // ----------------------------------------------------

        const {
            products,
            vendors
        } = await loadVimsData();


        // ----------------------------------------------------
        // DATABASE FIRST
        // ----------------------------------------------------

        const databaseAnswer =
            getDatabaseAnswer(
                userMessage,
                products,
                vendors
            );


        if (databaseAnswer) {

            console.log("==========================================");
            console.log("VIMS AI: DATABASE ANSWER");
            console.log("Gemini was NOT called");
            console.log("==========================================");


            return res.status(200).json({

                reply:
                    databaseAnswer,

                source:
                    "database"

            });

        }


        // ----------------------------------------------------
        // GEMINI FOR GENERAL QUESTIONS
        // ----------------------------------------------------

        try {

            const geminiAnswer =
                await getGeminiAnswer(
                    userMessage,
                    history,
                    products,
                    vendors
                );


            return res.status(200).json({

                reply:
                    geminiAnswer,

                source:
                    "gemini"

            });


        } catch (geminiError) {

            console.error("==========================================");
            console.error("GEMINI ERROR");
            console.error("==========================================");

            console.error(
                "Status:",
                geminiError.status
            );

            console.error(
                "Message:",
                geminiError.message
            );


            // ------------------------------------------------
            // QUOTA ERROR
            // ------------------------------------------------

            if (
                geminiError.status === 429 ||
                geminiError.message
                    ?.toLowerCase()
                    .includes("quota") ||
                geminiError.message
                    ?.toLowerCase()
                    .includes("resource_exhausted")
            ) {

                return res.status(200).json({

                    reply: `
Gemini AI has temporarily reached its free usage limit.

Your VIMS database is still working normally.

You can continue asking inventory questions such as:

• Show my products
• Show my vendors
• Give me an inventory summary
• Which product has the lowest stock?
• Which product has the highest stock?
• Which products need restocking?
• Which products are out of stock?
• What is my total inventory value?
                    `.trim(),

                    source:
                        "fallback"

                });

            }


            // ------------------------------------------------
            // 503 HIGH DEMAND
            // ------------------------------------------------

            if (
                geminiError.status === 503 ||
                geminiError.message
                    ?.includes("503")
            ) {

                return res.status(200).json({

                    reply: `
Gemini AI is temporarily unavailable because the AI service is experiencing high demand.

Your VIMS database is still working normally.

Please try your general AI question again later.
                    `.trim(),

                    source:
                        "fallback"

                });

            }


            // ------------------------------------------------
            // OTHER GEMINI ERROR
            // ------------------------------------------------

            return res.status(200).json({

                reply: `
I couldn't reach the Gemini AI service right now.

Your VIMS database is still working normally.

Please try your general AI question again later.
                `.trim(),

                source:
                    "fallback"

            });

        }


    } catch (error) {

        console.error("==========================================");
        console.error("VIMS AI ROUTE ERROR");
        console.error("==========================================");

        console.error(error);


        return res.status(500).json({

            error:
                "Something went wrong while processing your AI request."

        });

    }

});


// ============================================================
// TEST ROUTE
// ============================================================

router.get("/test", (req, res) => {

    res.json({

        message:
            "VIMS AI Copilot route is working",

        databaseAnswers:
            true,

        smarterInventoryQuestions:
            true,

        gemini:
            true,

        model:
            "gemini-3.8-flash"

    });

});

// ============================================================
// EXPORT
// ============================================================

module.exports = router;