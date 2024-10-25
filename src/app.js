const express = require("express");
const router = express.Router();
const ruleController = require("./controllers/ruleController");

router.post("/rules", ruleController.createRule);
router.post("/rules/combine", ruleController.combineRules);
router.post("/rules/evaluate", ruleController.evaluateRule);
router.get("/rules/:operatorId", ruleController.getRuleByBFS);

module.exports = router;

// src/app.js
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use("/api", require("./routes/api"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rule-engine", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
