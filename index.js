const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttlimcj.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const tasksCollection = client.db("tasksDb").collection("tasks");

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { user: email };
      const result = await tasksCollection.find(query).toArray();

      res.send(result);
    });

    app.delete("/delete/:_id", async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/update/:_id", async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) };
      let task = await tasksCollection.findOne(query);
      task = {
        $set: {
          status: `completed`,
        },
      };

      const result = await tasksCollection.updateOne(query, task);
      res.send(result);
    });

    app.post("/add-task", async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);

      res.send(result);
    });

    app.patch("/update-task/:_id", async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) };
      const updatedTask = req.body;

      let oldTask = await tasksCollection.findOne(query);

      if (!oldTask) {
        return "not this task found";
      }

      oldTask = {
        $set: {
          title: updatedTask.title,
          description: updatedTask.description,
        },
      };

      const result = await tasksCollection.updateOne(query, oldTask);

      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("Task Manager is managing ");
});

app.listen(port, () => {
  console.log(`Task Manager is managing on port ${port}`);
});
