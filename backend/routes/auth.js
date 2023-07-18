const Router = require("express").Router;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { getDb } = require("../db");

const router = Router();
let db;

getDb((error, database) => (db = database));

const createToken = () => {
  return jwt.sign({}, "secret", { expiresIn: "1h" });
};

router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Check if user login is valid
  // If yes, create token and return it to client
  const token = createToken();
  // res.status(200).json({ token: token, user: { email: 'dummy@dummy.com' } });
  res
    .status(401)
    .json({ message: "Authentication failed, invalid username or password." });
});

router.post("/signup", (req, res, next) => {
  const { email, password } = req.body;

  // Hash password before storing it in database => Encryption at Rest
  bcrypt
    .hash(password, 12)
    .then((hashedPW) => {
      // Store hashedPW in database
      db.collection("users")
        .insertOne({ email, password: hashedPW })
        .then((result) => {
          const token = createToken();

          res.status(201).json({ token, user: result.insertedId });
        })
        .catch((error) => {
          console.log(error);

          res.status(500).json({ message: "Creating the user failed." });
        });
    })
    .catch((err) => {
      console.log(err);

      res.status(500).json({ message: "Creating the user failed." });
    });

  // Add user to database
});

module.exports = router;
