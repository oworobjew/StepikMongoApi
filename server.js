const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require('body-parser');
const cors = require('cors')
mongoose.set('strictQuery', false);
const app = express();

app.use(bodyparser.json())
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then((r) => console.log('Connected to MongoDB'))
  .catch((e) => console.log('Failed to connect to MongoDB'))


const ProductsSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    about: {
        type: String,
        required: true,
        default: ''
    }
});
const Products = mongoose.model('Products', ProductsSchema)


// GET PRODUCTS with optional sort
app.get("/products", async (req, res) => {
    const sortby = req.query.sortby
    if (sortby == 'item') {
        await Products.find({}).sort({item: 1})
        .then((data) => {res.status(200).json(data)})
        .catch((error) => res.status(400).json(error));
    }
    else if (sortby == 'price') {
        await Products.find({}).sort({price: 1})
        .then((data) => {res.status(200).json(data)})
        .catch((error) => res.status(400).json(error));
    } 
    else if (sortby == 'quantity') {
        await Products.find({}).sort({quantity: 1})
        .then((data) => {res.status(200).json(data)})
        .catch((error) => res.status(400).json(error));
    } 
    else if (sortby == 'about') {
        await Products.find({}).sort({about: 1})
        .then((data) => {res.status(200).json(data)})
        .catch((error) => res.status(400).json(error));
    } 
    else {
        await Products.find({})
        .then((data) => {res.status(200).json(data)})
        .catch((error) => res.status(400).json(error));
    }
})

// ADD PRODUCT
// curl -d '{"item":"pineapple", "price":8, "quantity":1, "about":"pineappleeeee"}' -H "Content-Type: application/json" -X POST http://localhost:3000/products

app.post("/products", async (req, res) => {
    const { item, price, quantity, about } = req.body;
    await Products.create({ 
        item: item,
        price: price,
        quantity: quantity,
        about: about
     })
    .then((data) => res.status(201).json(data))
    .catch((error) => res.status(400).json(error));
})


// UPDATE PRODUCT
// curl -d '{"item":"strawberry", "price":1, "quantity":123, "about":"berries but raw"}' -H "Content-Type: application/json" -X PUT http://localhost:3000/products/63d28f715691921009e63996

app.put("/products/:id", async (req, res) => {
    const { id } = req.params;
    await Products.updateOne({_id: id},{$set: {
        item: req.body.item,
        price: req.body.price,
        about: req.body.about,
        quantity: req.body.quantity,
    }
    })
    .then((data) => res.status(204).json(data))
    .catch((error) => res.status(400).json(error));
})


// DELETE PRODUCT
// curl -X DELETE http://localhost:3000/products/63d28f715691921009e63996

app.delete("/products/:id", async (req, res) => {
    const { id } = req.params;
    await Products.deleteOne({_id: id})
    .then((data) => res.status(204).json(data))
    .catch((error) => res.status(400).json(error));
})


// REPORT
// curl -X GET http://localhost:3000/report

app.get("/report", async (req, res) => {
    await Products.aggregate([
        {
          $group: {
            _id: '$item',
            quantity: { $sum: '$quantity' },
            productvalue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        },
        {
            $sort: { totalValue: -1 }
        },
        {
            $group: {
              _id: 'report',
              products: { $push: '$$ROOT' },
              allproductsvalue: { $sum: '$productvalue' }
            }
        }
      ])
        .then(queryRes => queryRes[0])
        .then((data) => res.status(200).json(data))
        .catch((error) => res.status(400).json(error));
})


// RUN SERVER
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});