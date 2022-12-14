require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
        const myProducts = client.db('usedProductResale').collection('myPorducts');
        const paymentsCollection = client.db('usedProductResale').collection('payments');

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

        app.get('/bookings/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await carBooked.findOne(query);
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
            const query = {role: "buyer"};
            const result = await users.find(query).toArray();
            console.log(result);
            res.send(result);
        });

        app.get("/allSellers", async(req, res) => {
            const query = {role: "seller"};
            const result = await users.find(query).toArray();
            console.log(result);
            res.send(result);
        });

        app.get("/myProductsData", async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const result = await myProducts.find(query).toArray();
            res.send(result);
        });

        app.get('/users/admin/:email', async(req, res) => {
            const email = req.params.email;
            const query ={email: email};
            const user = await users.findOne(query);
            res.send({isAdmin: user?.role === 'admin'})
        });

        app.get('/users/seller/:email', async(req, res) => {
            const email = req.params.email;
            const query ={email: email};
            const user = await users.findOne(query);
            res.send({isSeller: user?.role === 'seller'})
        });


        app.get('/users/buyer/:email', async(req, res) => {
            const email = req.params.email;
            const query ={email: email};
            const user = await users.findOne(query);
            res.send({isBuyer: user?.role === 'buyer'})
        });

        app.post('/bookingCar', async(req, res) => {
            const car = req.body;
            const result = await carBooked.insertOne(car)      
            res.send(result);
        });

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                'payment_method_types': [
                    "card"
                  ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
              });
        })

        app.post('/payments', async(req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = {_id: ObjectId(id)};
            const updatedDoc = {
                $set:{
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await carBooked.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.post('/user', async(req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            res.send(result);
        });

        app.post("/addProduct", async(req, res) => {
            const products = req.body;
            const result = await myProducts.insertOne(products);
            res.send(result);
        });


        app.delete('/user/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await users.deleteOne(query);
            res.send(result);
        });

        app.delete('/order/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await carBooked.deleteOne(query);
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