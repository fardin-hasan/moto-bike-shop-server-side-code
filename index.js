const express = require('express')
require('dotenv').config()
var cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const app = express()
app.use(cors());
app.use(express.json())
const port = process.env.PORT || 5000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ex382.mongodb.net/myFirstDatabase?retryWrites=true&w=majorit`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("products");
        const allProducts = database.collection("productsCollections");
        const PurchaseCollection = database.collection("PurchaseCollection");
        const customerReview = database.collection("customerReview");
        const userCollection = database.collection("users");
        console.log('done')

        // find limited data for homepage
        app.get('/products', async (req, res) => {
            const cursor = allProducts.find({});
            const products = await cursor.limit(6).toArray();
            res.send(products);
        });

        // find all products
        app.get('/allProducts', async (req, res) => {
            const cursor = allProducts.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // single product based on product id 
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await allProducts.findOne(query);
            res.send(user);
        });

        // post purchase
        app.post('/purchase', async (req, res) => {

            const purchase = req.body;
            const result = await PurchaseCollection.insertOne(purchase);
            res.json(result);

        });

        // customer Review post
        app.post('/customerReview', async (req, res) => {

            const review = req.body;
            const result = await customerReview.insertOne(review);
            res.json(result);

        });
        // show customer reviews
        app.get('/customerReview', async (req, res) => {
            const cursor = customerReview.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        // users
        app.post('/users', async (req, res) => {

            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);

        });

        // put users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options)
        })

        // admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        // admin or user verify
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})