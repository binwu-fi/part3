const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const nameToAdd = process.argv[3]

const numberToAdd = process.argv[4]

const url = `mongodb+srv://binwufi:${password}@cluster0.hwvcrac.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

/*
const person = new Person({
  name: "Eija Virtanen",
  number: "050-852963",
});
*/
//change previous code to add new person to database
const person = new Person({
  name: nameToAdd,
  number: numberToAdd,
})

//following code add person to databae
/*
person.save().then((result) => {
  console.log("person saved!");
  mongoose.connection.close();
});
*/

//following code check if inputed name and number are exist and add them if both are exist

if (nameToAdd !== undefined && numberToAdd !== undefined) {
  person.save().then((result) => {
    //console.log('added', nameToAdd, 'number', numberToAdd, 'to phonebook') //replaced with following code line
    result.forEach((person) => {console.log(person)})
    mongoose.connection.close()
  })
  //} else if (nameToAdd === undefined) {
  //  mongoose.connection.close();
  //} else if (numberToAdd === undefined) {
  //  mongoose.connection.close();
} else if (nameToAdd === undefined && numberToAdd === undefined) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else if (numberToAdd === undefined) {
  mongoose.connection.close()
}
//following code print database to screen
/*
Person.find({}).then((result) => {
  console.log("phonebook:");
  //console.log(nameToAdd);
  //console.log(numberToAdd);
  result.forEach((person) => {
    console.log(person.name, person.number);
  });
  mongoose.connection.close();
});
*/
