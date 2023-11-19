//these code and file/folder belong to 3.13
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
  .connect(url)
  .then(() => {//.then((result)) is not needed
    console.log('connected to MongoDB:')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  //name: { type: String, minlength: 3, required: true },
  //improved version of name check
  name: {
    type: String,
    minlength: 3,
    validate: {
      validator: (v) =>
        /^[A-Za-zÄÖÅäöå]+[A-Za-zÄÖÅäöå\s]+[A-Za-zÄÖÅäöå]+$/.test(v),
      message: (props) =>
        `${props.value} does not fulfill minimal requirement (3 letters)`,
    },
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: (v) => /(^\d{2}[-]\d{6})|(^\d{3}[-]\d{5})/.test(v),
      message: (props) =>
        `${props.value} is not in correct format. It should be XX-XXXXXX OR XXX-XXXXX`,
    },
    required: true,
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
