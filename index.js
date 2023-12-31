//const http = require("http");
const express = require('express')
const app = express()
const cors = require('cors') //code for 3.9
require('dotenv').config() //code for 3.13

const Person = require('./models/person') // this line fot 3.13 and it deploy the module in the file

//following code line for 3.16
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
//following code line for 3.16 ends

const unknowEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//next two rows are for 3.7
//var morgan = require("morgan");
//app.use(morgan("tiny"));

//3.8
const morgan = require('morgan')
morgan.token('request-body', (req) => {
  return JSON.stringify(req.body)
})

//palautettu käyttöön 3.16 varten
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')
  next()
}
//app.use(requestLogger);
//palautettu käyttöön 3.16 varten

app.use(cors()) //code for 3.9
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens['request-body'](req, res),
    ]
      .join(' ')
      .concat('\n-----')
  })
)

/*
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
  ].join(" ");
});
*/
app.use(express.json()) //this is needed for adding new contact

app.use(express.static('build')) //this is for 3.11 frontend production build

app.use(requestLogger) //palautettu käyttöön 3.16 varten

// next part is not needed in exercise 3
/*
let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  { id: 5, name: "Matti Meikkalainen", number: "050-987654321" },
];
*/

app.get('/', (req, res) => {
  res.send('<h1>Hello Bin!</h1>')
})

/*
app.get("/api/persons", (req, res) => {
  res.json(phonebook);
});
*/
//change previous code to show phonebook from database
app.get('/api/persons', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

// not need in exersice 3: let tableSize = phonebook.length;
let date = new Date()

/*
app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${tableSize} people</p>
  <p>${date}</p>`);
  //res.send("<h1>Hello Bin!</h1>");
});
*/
//previous code changed to get tablesize from database

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      console.log(count)
      let result = `<p>Phonebook has info for ${count} people</p>
  <p>${date}</p>`
      response.send(result)
    })
    .catch((error) => next(error))
})

//3.3
/*
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = phonebook.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }

  response.json(person);
});
*/
//previous code changed for 3.13
/*
app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});
*/

//the previous code changed for 3.16
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//alla 3.16 vanha loppuosa
/*
 {
    console.log(error)
    response.status(400).send({ error: 'malformatted id'})
  });
});
*/

//3.4
/*
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  phonebook = phonebook.filter((person) => person.id !== id);

  response.status(204).end();
});
*/
//previous code changed for 3.15
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => { //then((result)=> is not needed
      response.status(204).end()
    })
    .catch((error) => next(error))
})

//next code is for 3.17
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

//3.5 and 3.6 below code needs
/*
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}


const generateId = () => {
  const newId = getRandomInt(1000000)
  return newId
}
*/
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'content is empty',
    })
  }

  if (!body.name) {
    return response.status(400).json({
      error: 'name is empty',
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number is empty',
    })
  }

  //below code is not needed in 3.22
  //let find = false
  //console.log(find);

  /*
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };
  */
  //previous code change to following (3.13)
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error)) //added for 3.19

  //next code is not needed
  /*
  phonebook.forEach((item) => {
    //console.log("nimi: ", item.name);
    if (item.name === body.name) {
      find = true;
      return response.status(400).json({
        error: "name must be unique",
      });
    }

    //console.log(find);
  });

  if (find === false) {
    phonebook = phonebook.concat(person);
    response.json(person);
  }
  */
})

/*
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  phonebook = phonebook.concat(person);
  //console.log(person);
  response.json(person);
});
*/
app.use(unknowEndpoint)
app.use(errorHandler)

/*
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

//Change previous code for "take backend to render"
/*
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

//Change previous code for 3.13
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

/*
var jsonData = [{
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  { id: 5, name: "Matti Meikkalainen", number: "050-987654321" }]

let find = false
console.log(find)
jsonData.forEach((item) => {
  console.log("nimi: ", item.name)
  if (item.name === "Matti Meikkalainen"){
    find = true
  }
  console.log(find)
})
*/
