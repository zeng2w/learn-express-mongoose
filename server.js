const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 8000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

let Home = require('./pages/home');
let Books = require('./pages/books');
let BooksStatus = require('./pages/books_status');
let Authors = require('./pages/authors');
let BookDetails = require('./pages/book_details');
let CreateBook = require('./pages/create_book');


const mongoose = require('mongoose');
const mongoDB = "mongodb://127.0.0.1:27017/my_library_db";
// mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function() {
  console.log('Connected to database');
});
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());


app.get('/home', (_, res) => {
  Home.show_home(res);
})

app.get('/available', (_, res) => {
  BooksStatus.show_all_books_status(res);
  Book.find({ status: 'available' }, 'title status -_id') // Assuming a 'status' field exists
  .then(books => {
    // Transforming the data to match the desired output
    const availableBooks = books.map(book => ({
      title: book.title,
      status: book.status,
    }));
    res.json(availableBooks);
  })
  .catch(err => {
    res.status(500).send({ message: err.message || "Some error occurred while retrieving books." });
  });
})

app.get('/books', (_, res) => {
  Books.show_books()
    .then((data) => res.send(data))
    .catch((_) => res.send('No books found'));
})

app.get('/authors', (_, res) => {
  Authors.show_all_authors(res);
  Author.find({}, 'name birth death -_id')
    .then(authors => {
      const authorsWithLifespan = authors.map(author => {
        const lifespan = author.death && author.birth ? (author.death.getFullYear() - author.birth.getFullYear()) : 'N/A';
        return { name: author.name, lifespan: `${lifespan}` };
      });
      res.json(authorsWithLifespan);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving authors." });
    });
})

app.get('/book_dtls', (req, res) => {
  BookDetails.show_book_dtls(res, req.query.id);
})

app.post('/newbook', (req, res) => {
    const familyName = req.body.familyName;
    const firstName = req.body.firstName;
    const genreName = req.body.genreName;
    const bookTitle = req.body.bookTitle;
    if(familyName && firstName && genreName && bookTitle) {
        CreateBook.new_book(res, familyName, firstName, genreName, bookTitle).catch(err => {
                res.send('Failed to create new book ' + err);
              });
    }
    else {
        res.send('Invalid Inputs');
    }

})
