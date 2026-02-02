const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

const app = express();

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .catch(err => {
        console.log('Mongo connection error!');
        console.log(err);
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello from YelpCamp!!');
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: 'My Backyard', description: 'My cheap camping ground!!'});
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log('Serving on Port 3000!');
});
