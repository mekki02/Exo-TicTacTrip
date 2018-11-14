const express = require("express");
const lc = require("letter-count");
const jwt = require("jwt-simple");
const config = require("../config/config");
let users = require("../users/users");
let ontime = require("ontime");

const router = express.Router();

// Retourne l'index de l'utilisateur ayant le email passé en paramètre.
// Si non trouvé retourne Null
const findUserIndex = function(email) {
  let i = 0;
  while (i < users.length) {
    if (email === users[i].email) {
      return i;
    }
    i++;
  }
  return null;
};

// Remise à zero le compteur de la limite des mots par jour
const resetWordCountedToZero = function() {
  let i = 0;
  while (i < users.length) {
    users[i].wordsCounted = 0;
    i++;
  }
};

// Récupération des données passées dans la requête en content type = "text/plain"
function rawBody(req, res, next) {
  req.setEncoding("utf8");
  req.rawBody = "";
  req.on("data", function(chunk) {
    req.rawBody += chunk;
  });
  req.on("end", function() {
    next();
  });
}

//Retourne un tableau contenant tout les paragraphes du texte
const splittingtoParagraphs = function(text) {
  paragraphs = text.split("\r\n");
  return paragraphs;
};

//Justification d'un paragraphe passé en paramètre et retourne le paragraphe justifié
const justifyOneParagraph = function(paragraph) {
  //on stocke tous les mots dans un tableau
  words = paragraph.split(" ");
  let lines = [],
    index = 0;
  while (index < words.length) {
    let letterCounted = words[index].length;
    let last = index + 1;
    //on boucle sur l'ajout des mots jusqu'à ce qu'on atteint une longueur de 80 caractère
    while (last < words.length) {
      if (words[last].length + letterCounted + 1 > 80) break;
      letterCounted += words[last].length + 1;
      last++;
    }
    let newLine = "";
    let difference = last - index - 1;
    // Si on est sur la dernière ligne ou le nombre de mots dans la ligne est egal à 1
    if (last === words.length || difference === 0) {
      // Insertion des mots de la ligne à ajouter
      for (let i = index; i < last; i++) {
        newLine += words[i] + " ";
      }
      newLine = newLine.substr(0, newLine.length - 1);
      // Ajout des espaces pour compléter la dernière ligne
      for (let i = newLine.length; i < 80; i++) {
        newLine += " ";
      }
    } else {
      // Mettre le même nombre des espaces entres les mots de la ligne
      let spaces = (80 - letterCounted) / difference;
      let remainder = (80 - letterCounted) % difference;
      //Boucle pour ajout des mots avec les espaces
      for (let i = index; i < last; i++) {
        newLine += words[i];
        if (i < last - 1) {
          let spacesToAdd = spaces + (i - index < remainder ? 1 : 0);
          for (let j = 0; j <= spacesToAdd; j++) {
            newLine += " ";
          }
        }
      }
    }
    //Insertion de la ligne dans un tableau
    lines.push(newLine);
    index = last;
  }
  let finalText = "";
  //Boucle pour concatination des lignes justifiés
  for (i = 0; i < lines.length; i++) {
    finalText += lines[i] + "\n";
  }
  return finalText;
};

//Concatination des paragraphes après leur justification et retourne le texte justifié
const justifyParagraphs = function(paragraphs) {
  let justifiedText = "";
  let i = 0;
  // Elimination des paragraphe vide du tableau
  let cleanParagraphs = paragraphs.filter(paragraph => paragraph !== "");
  while (i < cleanParagraphs.length) {
    formattedParagraph = justifyOneParagraph(cleanParagraphs[i]);
    justifiedText += formattedParagraph;
    i++;
  }
  return justifiedText;
};

//Justification du texte
const justifyText = function(text) {
  let paragraphs = splittingtoParagraphs(text);
  return justifyParagraphs(paragraphs);
};

router.use(rawBody);

// Utilisation du package onTime pour déclencher la fonction de remise
// à zero du compteur des mots quotidiennement à minuit
ontime(
  {
    cycle: "00:00:00"
  },
  function(ot) {
    resetWordCountedToZero();
    ot.done();
    return;
  }
);

router.post("/", function(req, res, next) {
  const header = req.headers["authorization"];
  //Verification de l'éxistance du token
  if (typeof header !== "undefined") {
    //Extraction du token du Header
    const bearer = header.split(" ");
    const jwttoken = bearer[1];
    let decoded;
    //Verification de la validité du token
    try {
      decoded = jwt.decode(jwttoken, config.secret);
    } catch (e) {
      //Si token invalide
      res.status(401).json({
        message: "Unauthorized: Invalid Token"
      });
    } finally {
      if (decoded) {
        //Si token valide exécution du code en dessous
        let initialText = req.rawBody;
        let finalText = "";
        wordsNumber = lc.count(initialText).words;
        let userIndex = findUserIndex(decoded.email);
        if (users[userIndex].wordsCounted + wordsNumber <= 80000) {
          users[userIndex].wordsCounted += wordsNumber;
          finalText = justifyText(initialText);
          res.send(finalText);
        } else {
          res.status(402).json({ message: "nombre de mots limité à 80000 !" });
        }
      }
    }
  } else {
    //Non disponibilité du token
    res.status(403).json({ message: "Unauthorized !" });
  }
});

module.exports = router;
