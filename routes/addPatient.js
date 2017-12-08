const express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/addPatient", (req, res, next) => {
    res.render("addPatient", {title: "Add a Patient"}) ;
});

module.exports = router;
