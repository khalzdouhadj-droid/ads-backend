const express = require("express");
const axios = require("axios");
const { saveToken, getToken } = require("../tokenStore");

const router = express.Router();

const {
  TIKTOK_APP_ID,
  TIKTOK_APP_SECRET,
  TIKTOK_REDIRECT_URI,
  TIKTOK_ADVERTISER_ID,
} = process.env;

router.get("/login", (req, res) => {
  const url =
    `https://business-api.tiktok.com/portal/auth` +
    `?app_id=${TIKTOK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}` +
    `&state=store_dashboard`;
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const { auth_code } = req.query;
  if (!auth_code) return res.status(400).send("لم يتم استلام كود الموافقة من TikTok");

  try {
    const tokenRes = await axios.post(
      "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
      {
        app_id: TIKTOK_APP_ID,
        secret: TIKTOK_APP_SECRET,
        auth_code,
      }
    );

    saveToken("tiktok", tokenRes.data.data);
    res.send("تم ربط حساب TikTok Ads بنجاح. يمكنك إغلاق هذه الصفحة والعودة للوحة التحكم.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("فشل ربط الحساب. تحقق من إعدادات TIKTOK_APP_ID و TIKTOK_APP_SECRET.");
  }
});

router.get("/campaigns", async (req, res) => {
  const token = getToken("tiktok");
  if (!token) return res.status(401).json({ error: "الحساب غير مربوط بعد. زر /auth/tiktok/login أولا." });

  try {
    const result = await axios.get(
      "https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/",
      {
        headers: { "Access-Token": token.access_token },
        params: {
          advertiser_id: TIKTOK_ADVERTISER_ID,
          report_type: "BASIC",
          dimensions: JSON.stringify(["campaign_id"]),
          metrics: JSON.stringify(["spend", "impressions", "clicks", "conversion"]),
          data_level: "AUCTION_CAMPAIGN",
          start_date: "2026-06-01",
          end_date: "2026-07-04",
        },
      }
    );
    res.json(result.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "تعذر جلب بيانات الحملات من TikTok" });
  }
});

module.exports = router;
