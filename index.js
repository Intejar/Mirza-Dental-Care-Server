const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xk69pxb.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT (req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unothorized user'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden Access'})
        }
        req.decoded = decoded;
        next()
    })

}

async function run(){
    
    try{
        const serviceCollection = client.db('DrMirza').collection('service')
        const reviewCollection = client.db('DrMirza').collection('review')
        const userServiceCollection = client.db('DrMirza').collection('userService')
        
        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({token})
        })
        app.get('/service', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services', async(req, res)=>{
            let query = {};
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
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
        app.get('/userservices', async(req, res)=>{
            let query = {};
            if(req.query.userEmail){
                query = {
                    userEmail : req.query.userEmail
                }
            }
            const cursor = userServiceCollection.find(query);
            const userServices = await cursor.toArray();
            res.send(userServices);
        })
        app.post('/userservices', async (req, res) => {
            const userService = req.body;
            const result = await userServiceCollection.insertOne(userService)
            res.send(result)
        })
        app.get('/userReview',verifyJWT, async(req, res)=>{
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unothorized user'})
            }
            let query = {};
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({date : -1});
            const review = await cursor.toArray();
            res.send(review);
        })
        app.get('/review', async(req, res)=>{
            let query = {};
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({date : -1});
            const userServices = await cursor.toArray();
            res.send(userServices);
        })
        app.post('/review', async (req, res) => {
            const review = req.body;
            review.date = new Date()
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.patch('/review/:id', async (req, res) => {
            const id = req.params.id;
            const edited = req.body.comment
            const query = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    comment: edited
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
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
