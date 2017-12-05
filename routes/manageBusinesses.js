const express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/manageBusinesses", (req, res, next) => {
    res.render("manageBusinesses", {title: "Manage Business\"s"}) ;
});

module.exports = router;
