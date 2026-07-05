require("dotenv").config();
const express = require("express");
const cors = require("cors");

const metaRoutes = require("./routes/meta");
const tiktokRoutes = require("./routes/tiktok");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("سيرفر ربط الإعلانات يشتغل. استعملي /auth/meta/login أو /auth/tiktok/login لربط الحسابات.");
});

app.use("/auth/meta", metaRoutes);
app.use("/auth/tiktok", tiktokRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`السيرفر يشتغل على المنفذ ${PORT}`);
});
