// require('dotenv').config();
import { config } from 'dotenv';
config();
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

import Contact from './models/contactModel.js';
import { errorHandler, unknownEndpoint } from './middleware/errorHandler.js';

const mongodb_uri = process.env.MONGODB_URL;

const app = express();

//setup connection for the mongoDB atlas
mongoose.set('strictQuery', false);

mongoose.connect(mongodb_uri).then(() => {
    console.log('connected to MongoBD');
}).catch((err) => {
    console.log('error connecting to MongoDB:', err.message)
});

//create the middlewares that act on the network request and response object
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

morgan.token('tile', function(req) {
    return JSON.stringify(req.body)
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :tile'));

app.get('/api/persons', (request, response, next) => {
    Contact.find({}).then((persons) => {
       response.json(persons)
    }).catch((error) => {
        console.log(error);
        next(error)
    }) 
});

app.get('/info', (request, response, next) => {
    Contact.find({}).then((savedContact) => {
        response.send(`
            <p>Phonebook has info for ${savedContact.length} people</p>
            <p>${new Date()}</p>
        `)
    }).catch((err) => {
        next(err)
    })
});

app.get(`/api/persons/:id`, async (request, response, next) => {
    const id = request.params.id;
    //get the resources from the array
    Contact.findById(id).then((savedContact) => {
        if(savedContact){
            response.status(200).json(savedContact)
        }else {
            response.status(404).json({
                error: "resource not found"
            })
        }
    }).catch((error) => {
        next(error)
    })
});

app.delete('/api/persons/:id', async (request, response) => {
    const id = request.params.id;
    //search for the resource and delete if available
    const targettedPerson = await Contact.findById(id)
    
    if(!targettedPerson){
        return response.status(404).json({
            message: `this resource does not exist on our server`
        })
    }

    Contact.findByIdAndDelete(id).then(() => {
        response.status(204).end();
    }).catch((error) => {
        console.log(error);
    })

    // response.status(204).end()
});

app.post('/api/persons', async (request, response, next) => {
    const { name, number } = request.body;

    if(name.trim().length < 1) {
        return response.status(404).json({
            error: 'person name is missing, please retry'
        })
    }

    if(number.trim().length < 1) {
        return response.status(404).json({
            error: 'person number is missing, please add number'
        })
    }

    //check if it already exist in the server store
    const existingPerson = await Contact.find({ name }) 
    
    if(existingPerson.length) {
        const selected = existingPerson[0];
        selected.name = name;
        selected.number = number;

        return selected.save().then((savedContact) => {
            response.status(202).json({
                message: 'contact updated successfully',
                data: savedContact 
            })
        }).catch((error) => {
            next(error)
        })
    }

    const newPerson = new Contact({
        name,
        number
    });

    newPerson.save().then((result) => {
        response.status(200).json({
            message: 'contact created successfully',
            data: result 
        })
    }).catch((error) => {
        next(error)
    })
});

app.use(unknownEndpoint);
app.use(errorHandler)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
});