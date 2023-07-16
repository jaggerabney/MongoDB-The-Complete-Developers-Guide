const Router = require("express").Router;
const { Decimal128 } = require("mongodb");
require("dotenv").config();

const { getDb } = require("../db");

const router = Router();
let db;

getDb((error, database) => (db = database));

// Get list of products
router.get("/", async (req, res, next) => {
  // Return a list of all products
  const products = [];

  try {
    const allProducts = db.collection("products").find();

    for await (const product of allProducts) {
      product.price = product.price.toString();

      products.push(product);
    }
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ products });
});

// Get single product
router.get("/:id", (req, res, next) => {
  const product = products.find((p) => p._id === req.params.id);
  res.json(product);
});

// Add new product
// Requires logged in user
router.post("", async (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image,
  };
  let result;

  try {
    result = await db.collection("products").insertOne({ ...newProduct });
  } catch (err) {
    console.log(err);
  }

  res
    .status(201)
    .json({ message: "Product added", productId: result.insertedId });
});

// Edit existing product
// Requires logged in user
router.patch("/:id", (req, res, next) => {
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    price: parseFloat(req.body.price), // store this as 128bit decimal in MongoDB
    image: req.body.image,
  };
  console.log(updatedProduct);
  res.status(200).json({ message: "Product updated", productId: "DUMMY" });
});

// Delete a product
// Requires logged in user
router.delete("/:id", (req, res, next) => {
  res.status(200).json({ message: "Product deleted" });
});

module.exports = router;
