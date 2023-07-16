const { MongoClient } = require("mongodb");
require("dotenv").config();

let db;

function getDb(callback) {
  if (db) {
    return callback(null, db);
  }

  MongoClient.connect(process.env.DB_CONNECTION_STRING)
    .then((client) => {
      db = client.db();

      callback(null, db);
    })
    .catch((err) => console.log(err));
}

module.exports = {
  getDb,
};
