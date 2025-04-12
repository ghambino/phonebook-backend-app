import mongoose from "mongoose";

if(process.argv.length < 3){
    console.log('provide password as argument');
    process.exit(1);
};

const password = process.argv[2];

const url = `mongodb+srv://phonebook:${password}@phonebook-app.szcbdz1.mongodb.net/persons?retryWrites=true&w=majority&appName=phonebook-app`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const contactSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Contact = mongoose.model('Contact', contactSchema);

if(process.argv[3] && process.argv[4]) {
    
    const newContact = new Contact({
        name: process.argv[3],
        number: process.argv[4],
    })

    newContact.save().then((savedDetails) => {
        console.log(`added ${savedDetails.name} number ${savedDetails.number} to phonebook`);
        // mongoose.connection.close()
    }).catch((error) => {
        console.log(error);
    })
};

Contact.find({}).then((persons) => {
    console.log('Phonebook:');
    persons.forEach((contact) => {
        console.log(`${contact.name} ${contact.number}`);
    })
    mongoose.connection.close();
}).catch((error) => {
    console.log(error);
}) 

