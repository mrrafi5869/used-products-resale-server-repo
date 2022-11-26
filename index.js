require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9t60goe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const carCategories = client.db('usedProductResale').collection('carCategories');
        const carBooked = client.db('usedProductResale').collection('booked');
        const users = client.db('usedProductResale').collection('users');

        app.get('/carCategories', async(req, res) => {
            const query = {};
            const options = await carCategories.find(query).toArray();
            res.send(options);
        });

        app.get('/allCars/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await carCategories.findOne(query);
            res.send(result);
        });

        app.get("/allUsers", async(req, res) => {
            const query = {};
            const result = await users.find(query).toArray();
            res.send(result);
        });

        app.get("/myOrders", async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const result = await carBooked.find(query).toArray();
            res.send(result);
        });
        
        app.get("/allBuyers", async(req, res) => {
            const query = {user: "buyer"};
            const result = await users.find(query).toArray();
            console.log(result);
            res.send(result);
        });

        app.get("/allSellers", async(req, res) => {
            const query = {user: "seller"};
            const result = await users.find(query).toArray();
            console.log(result);
            res.send(result);
        });

        app.post('/bookingCar', async(req, res) => {
            const car = req.body;
            const result = await carBooked.insertOne(car)      
            res.send(result);
        });

        app.post('/user', async(req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            res.send(result);
        });

        app.delete('/user/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await users.deleteOne(query);
            res.send(result);
        });

    }
    finally{

    }
}
run().catch(err => console.error(err));

app.get('/', async(req, res) => {
    res.send('used products server is running');
});

app.listen(port, async(req, res) => {
    console.log(`server is running on port ${port}`);
});