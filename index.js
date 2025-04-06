const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);
app.use(express.json());

// database mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f6pqege.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // create Database
    const itemCollection = client.db("itemsDB").collection("items");
    const PurchaseItemCollection = client
      .db("itemsDB")
      .collection("purchaseItemCollection");

    // create apis
    app.post("/items", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/items", async (req, res) => {
      const cursor = itemCollection.find({});
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.findOne(query);
      res.send(result);
    });

    // my foods api

    app.get("/my-foods", async (req, res) => {
      try {
        // Getting the logged-in user's email from the query parameters
        const userEmail = req.query.email;
        console.log('Received email:', userEmail);

        if (!userEmail) {
          return res.status(400).send({ message: "Email is required" });
        }

        const query = { "addBy.email": userEmail}; // Accessing the email field inside the 'addedBy' object
        const result = await itemCollection.find(query).toArray();
        console.log(result)

        // Sending the result as a response
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: err.message });
      }
    });

    // purchase items apis

    app.post("/purchase-items", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await PurchaseItemCollection.insertOne(newItem);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("Hello,Server");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
