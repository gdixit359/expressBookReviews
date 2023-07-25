const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
const jwt = require('jsonwebtoken');
const session = require('express-session')
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }
  const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
  }
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!doesExist(username)) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
  
});
public_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      try{
      req.session.authorization = {
        accessToken,username
    }
}
catch(err){}
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  });
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const query = req.params.author;
  let result = [];
  for (const bookId in books) {
    if (books.hasOwnProperty(bookId)) {
      const author = books[bookId].author;
      if(author == query){
          result = books[bookId]
      }
    }
  }
    res.send(result);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const query = req.params.title;
  let result = [];
  for (const bookId in books) {
    if (books.hasOwnProperty(bookId)) {
      const title = books[bookId].title;
      if(title == query){
          result = books[bookId]
      }
    }
  }
    res.send(result);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});
public_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (book) { //Check is friend exists
        let review = req.body.review;
        //Add similarly for firstName
        //Add similarly for lastName
        //if DOB the DOB has been changed, update the DOB 
        if(review) {
            book["review"] = review;
        }
        //Add similarly for firstName
        //Add similarly for lastName
        book[isbn]=book;
        res.send(`Review updated to ${review}.`);
    }
    else{
        res.send("Unable to find review");
    }
  });
  public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (isbn){
     books[isbn]['reviews'] = '';
    }
    res.send(`Review deleted`);
  });
module.exports.general = public_users;
