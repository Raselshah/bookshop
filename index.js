const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0gfhv0g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const bookCollection = client.db("books").collection("book");

async function run() {
  try {
    await client.connect();

    app.get("/api/v1/all-book", async (req, res) => {
      const { search, genre, year } = req.query;

      const query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } },
        ];
      }

      if (genre) {
        query.genre = { $regex: genre, $options: "i" };
      }

      if (year) {
        query.year = parseInt(year);
      }

      const result = await bookCollection
        .find(query)
        .sort({ updatedAt: -1 })
        .limit(10)
        .toArray();

      res.send(result);
    });

    app.get("/api/v1/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });

    app.post("/api/v1/book-add", async (req, res) => {
      const book = req.body;

      book.updatedAt = new Date();
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.patch("/api/v1/book-update/:id", async (req, res) => {
      const id = req.params.id;
      const updateFields = req.body;

      updateFields.updatedAt = new Date();

      const filter = { _id: new ObjectId(id) };
      const update = { $set: updateFields };

      const result = await bookCollection.updateOne(filter, update);

      res.send(result);
    });

    app.delete("/api/v1/book/:deleteId", async (req, res) => {
      const id = req.params.deleteId;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(filter);
      res.send(result);
    });

    app.patch("/api/v1/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: {
          review: req.body.review,
          updatedAt: new Date(),
        },
      };

      const result = await bookCollection.updateOne(filter, update);
      res.send(update);
    });
  } finally {
    //
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("bookShop connect db");
});

app.listen(port, () => {
  console.log("listen db to", port);
});
