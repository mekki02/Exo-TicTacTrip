const express = require("express");
let users = require("../users/users");
const jwt = require("jwt-simple");
const config = require("../config/config");

const router = express.Router();

// Retourne l'utilisateur ayant l'email passé en paramètre 
// Si non trouvé , retourne Null
function findUser(email) {
  let i = 0;
  while (i < users.length) {
    if (email === users[i].email) {
      return users[i];
    }
    i++;
  }
  return null;
}

// Retourne un token encodé 
function getToken(email) {
  return jwt.encode(email, config.secret);
}

router.post("/", function(req, res, next) {
  if (!req.body.email) {
    res.status(400).json({
      message: "Champs vide !"
    });
  } else {
    user = findUser(req.body.email);
    if (user === null) {
      res.status(404).json({
        message: "Utilisateur non trouvé !"
      });
    } else {
      res.status(200).json({
        token: getToken({email: user.email})
      });
    }
  }
});

module.exports = router;
