const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient } = require('mongodb');
require ('dotenv').config();

const port = process.env.PORT || 5000;
// middleware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a744t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log("database Connected");
        const database = client.db('ema_Shop');
        const productsCollection = database.collection('product');
        const orderCollection = database.collection('orderproduct');
        // get Products Api 
        app.get('/products', async(req,res)=>{
            const cursor = productsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            res.send({count,products});
        });
        // ADD to cart data 
        app.post('/products/bykeys', async(req,res)=>{
            const keys = req.body;
            const query = {key: {$in: keys}}
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req,res) => {
    res.send("Start Ema-jon Server");
});

app.listen(port,()=>{
    console.log('Server is running And this Port',port);
})