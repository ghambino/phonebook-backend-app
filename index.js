import express from 'express';
import morgan from 'morgan';
import cors from 'cors'

let personsData = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const app = express();
app.use(cors())
app.use(express.json());

morgan.token('tile', function(req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :tile'))

app.get('/api/persons', (request, response) => {
    response.json(personsData);
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${personsData.length} people</p>
        <p>${new Date()}</p>
    `)
})

app.get(`/api/persons/:id`, (request, response) => {
    const id = request.params.id;
    //get the resources from the array
    const targettedPerson = personsData.find(unit => unit.id == id);

    if(!targettedPerson){
        return response.status(404).json({
            message: `this resource does not exist on our server`
        })
    }

    return response.json(targettedPerson)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    //search for the resource and delete if available
    const targettedPerson = personsData.find(unit => unit.id == id);

    if(!targettedPerson){
        return response.status(404).json({
            message: `this resource does not exist on our server`
        })
    }

    personsData = personsData.filter(unit => unit.id !== id);
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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
    const existingPerson = personsData.find(unit => unit.name == name);
    if(existingPerson) {
        return response.status(404).json({
            error: 'name must be unique, please choose another name'
        })
    }

    const newPerson = {
        id: (Math.random() * 100000).toFixed(0),
        name,
        number
    }

    personsData = [...personsData, newPerson];
    response.status(200).json({
        message: 'contact created successfully',
        data: newPerson
    })
})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})