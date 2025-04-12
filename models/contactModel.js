import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 5,
      required: true
    },
    number: {
      type: String,
      minLength: 8,
      validate: {
        validator: function(value) {
          //assert 080-57585885858 or 08-575884849949 is valid
          return /(\d{2}|\d{3})-\d+/.test(value)
        },
        message: props =>  `${props.value} is not a valid phone number format`
      }
    }
});

contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

const Contact = mongoose.model('Contact', contactSchema)

export default Contact