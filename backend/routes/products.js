const Router = require("express").Router;
const { Decimal128, ObjectId } = require("mongodb");
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
router.get("/:id", async (req, res, next) => {
  const productId = req.params.id;
  let product;

  try {
    product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    product.price = product.price.toString();
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ product });
});

// Add new product
// Requires logged in user
router.post("", async (req, res, next) => {
  const { name, description, price, image } = req.body;

  const newProduct = {
    name,
    description,
    price: Decimal128.fromString(price.toString()), // store this as 128bit decimal in MongoDB
    image,
  };
  let result;

  try {
    result = await db.collection("products").insertOne({ ...newProduct });
  } catch (err) {
    console.log(err);
  }

  res
    .status(201)
    .json({ message: "Product added!", productId: result.insertedId });
});

// Edit existing product
// Requires logged in user
router.patch("/:id", async (req, res, next) => {
  const { name, description, price, image } = req.body;
  const productId = req.params.id;

  const updatedProduct = {
    name,
    description,
    price: parseFloat(price), // store this as 128bit decimal in MongoDB
    image,
  };

  try {
    await db
      .collection("products")
      .updateOne({ _id: new ObjectId(productId) }, { $set: updatedProduct });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ message: "Product updated!", productId });
});

// Delete a product
// Requires logged in user
router.delete("/:id", async (req, res, next) => {
  const productId = req.params.id;

  try {
    await db.deleteOne({ _id: new ObjectId(productId) });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ message: "Product deleted!" });
});

module.exports = router;
