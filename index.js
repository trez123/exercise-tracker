const express = require('express')
const app = express()
const cors = require('cors');
const { urlencoded } = require('express');
require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database Successfully Connected XD");
}).catch(()=> {
  console.log("Error, Something must have went wrong")
});

const userSchema = mongoose.Schema({
 username: {
  type: String,
  unique: true,
 }
}, {versionKey: false});

const User = mongoose.model("User", userSchema);


const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  userId: String
},{versionKey: false});

const Exercise = mongoose.model("Exercise", exerciseSchema);



app.use(cors());
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async (req, res) => {
 const users = await User.find();
 res.send(users);
});


app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const userExist = await User.findOne({username});

  if(userExist){
    res.json(userExist);
  }

  if(!date){
    date = new Date();
  }

  const user = await User.create({
    username,
   });

  res.json(user);
});

// GET request to /api/users/:_id/logs

app.get("/api/users/:_id/logs", async (req, res) => {
  let {from, to, limit} = req.query;
  const _id = req.params._id;
  const userExist = await User.findById({_id});

  if(!userExist){
    res.json({message: "No User Exists with that deh id big man XD"})
  }

  let filter = { _id };
  let dateFiter = {};
  if(from){
    dateFiter["$gte"] = new Date(from);
  }
  if(to){
    dateFiter["$lte"] = new Date(to);
  }
  if(from || to){
    filter.date = dateFiter;
  }

  if(!limit){
    limit = 100;
  }


  let exercises = await Exercise.find( filter ).limit(limit);
  exercises = exercises.map(exercise => {
    return{
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }
  });
  res.json({
    username: userExist.username,
    count: exercises.length,
    _id: _id,
    log: exercises
  });
});



app.post("/api/users/:_id/exercises", async (req, res) =>{
  let { description, duration, date} = req.body;
  const _id = req.params._id;

  const userExist = await User.findById({_id});

  if(!userExist){
    res.json({message: "No user exists with that id man."})
  }

  if(!date){
    date = new Date();
  }else {
    date = new Date(date);
  }


  const exercise = await Exercise.create({
    username: userExist.username,
    description,
    duration,
    date,
    _id
  })


  res.send({
    username: userExist.username,
    _id: _id,
    description,
    duration,
    date: date.toDateString()
  });


});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
