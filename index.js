const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xk69pxb.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    
    try{
        const serviceCollection = client.db('DrMirza').collection('service')
        const reviewCollection = client.db('DrMirza').collection('review')
        app.get('/service', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
        app.get('/review', async(req, res)=>{
            let query = {};
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({dateAdded : -1});
            const review = await cursor.toArray();
            res.send(review);
        })
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne({review, dateAdded: new Date()})
            res.send(result)
        })
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })



    }
    finally{

    }

}
run().catch(e => console.log(e))

app.get('/', (req, res)=>{
    res.send('dental care server is running')
})

app.listen(port , ()=>{
    console.log(`server running on port ${port}`)
})
