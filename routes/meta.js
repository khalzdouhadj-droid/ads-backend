const express = require("express");
const axios = require("axios");
const { saveToken, getToken } = require("../tokenStore");

const router = express.Router();

const {
  META_APP_ID,
  META_APP_SECRET,
  META_REDIRECT_URI,
  META_AD_ACCOUNT_ID,
} = process.env;

router.get("/login", (req, res) => {
  const scope = "ads_read,ads_management";
  const url =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}` +
    `&scope=${scope}`;
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("لم يتم استلام كود الموافقة من Meta");

  try {
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: META_APP_ID,
          client_secret: META_APP_SECRET,
          redirect_uri: META_REDIRECT_URI,
          code,
        },
      }
    );

    saveToken("meta", tokenRes.data);
    res.send("تم ربط حساب Meta Ads بنجاح. يمكنك إغلاق هذه الصفحة والعودة للوحة التحكم.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("فشل ربط الحساب. تحقق من إعدادات META_APP_ID و META_APP_SECRET.");
  }
});

router.get("/campaigns", async (req, res) => {
  const token = getToken("meta");
  if (!token) return res.status(401).json({ error: "الحساب غير مربوط بعد. زر /auth/meta/login أولا." });

  try {
    const result = await axios.get(
      `https://graph.facebook.com/v19.0/act_${META_AD_ACCOUNT_ID}/insights`,
      {
        params: {
          access_token: token.access_token,
          fields: "campaign_name,spend,impressions,clicks,actions",
          level: "campaign",
          date_preset: "last_30d",
        },
      }
    );
    res.json(result.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "تعذر جلب بيانات الحملات من Meta" });
  }
});

module.exports = router;
