const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cookieParser = require("cookie-parser");


const app = express();

const oneDay = 1000 * 60 * 60 * 24;

//session
app.use(session({
    secret: 'ram-dhanu',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay }
}));

//database connection
const mongoose = require('mongoose');
const DB = 'mongodb+srv://sky:sky@cluster0.de1mtdi.mongodb.net/todo?retryWrites=true&w=majority';
mongoose.connect(DB).then(() => {
    console.log("connection successful");
}).catch((err) => {
    console.log(err);
});

var BookSchema = mongoose.Schema({
    url: String,
    name: String,
    price: Number
});

var Book = mongoose.model('Book', BookSchema, 'bookstore');

var ProductSchema = mongoose.Schema({
    user: String,
    data: Array
});

var Product = mongoose.model('Product', ProductSchema, 'products');


var UserSchema = mongoose.Schema({
    username: String,
    password: String
});

var User = mongoose.model('user', UserSchema, 'userdata');

//middleWares
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());


app.get('/', (req, res) => {
    if (!req.session.isAuth) {
        return res.render('./login.ejs', {
            name: null,
        });
    }
    res.sendFile(path.resolve('./index.html'));
});
app.get('/clothes', async(req, res) => {
    const data = await Book.find({});
    res.render('./clothes.ejs', { data: data });
})

app.get('/vegitable', (req, res) => {
    res.status(200).sendFile(path.resolve('./vegi.html'));
});

app.post('/book/:id', async(req, res) => {
    if (!req.session.isAuth) {
        return res.redirect("/login");
    }
    const data = await Product.findOne({ 'user': req.session.userid });
    if (data === null) {
        const newuser = new Product({ user: req.session.userid, data: [{ id: req.params.id, flag: false }] });
        newuser.save();
        return res.redirect('/');
    }
    const dd = data.data;
    dd.push({ id: req.params.id, flag: false });
    const rrr = await Product.updateOne({ user: req.session.userid }, { $set: { data: dd } }, { upsert: true });
    rrr.upserted;
    res.redirect('/');
});

app.get('/register', (req, res) => {
    return res.render('./regi.ejs', {
        name: null,
    })
});

app.post('/register', async(req, res) => {
    if (req.body.password !== req.body.repassword) {
        return res.render('./regi.ejs', {
            name: "password does not match",
        })
    }
    const pass = await bcrypt.hash(req.body.password, 10);
    const book1 = new User({ username: req.body.username, password: pass });
    book1.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    return res.render('./login.ejs', {
        name: null,
    });
});

app.post('/login', async(req, res) => {
    let { username, password } = req.body;
    const user = await User.find({ username: username });
    if (user === []) {
        return res.render('./login.ejs', {
            name: "This username and password does not exist",
        });
    }
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
        return res.render('./login.ejs', {
            name: "This username and password does not exist",
        });
    }
    if (username !== user[0].username) {
        return res.render('./login.ejs', {
            name: "This username and password does not exist",
        });
    }
    req.session.isAuth = true;
    req.session.userid = username;
    res.redirect('/dashbord');
});

app.get('/dashbord', (req, res) => {
    if (!req.session.isAuth) {
        return res.render('./login.ejs', {
            name: null,
        });
    }
    res.sendFile(path.resolve('./index.html'));
});

app.get('/confirm/:id', async(req, res) => {
    const data = await Book.findOne({ id: req.params.id });
    res.render('./confirm.ejs', { data: data });
});
app.listen(process.env.PORT || 3000);