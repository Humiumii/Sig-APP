// backend/orsProxy.js
const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

const ORS_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlkNDc0NTk1YzZmZjQzNWJhMjBmZTkwYzZkZjA3NzM1IiwiaCI6Im11cm11cjY0In0"; // si usas variable .env

router.post("/directions", async (req, res) => {
  try {
    const orsRes = await fetch(
      "https://api.openrouteservice.org/v2/directions/foot-walking",
      {
        method: "POST",
        headers: {
          Authorization: ORS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const json = await orsRes.json();
    return res.status(orsRes.status).json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "ORS proxy failed" });
  }
});

module.exports = router;
