const express = require('express');
const mongoose = require('mongoose');
const Schoolroutes = require('./routes/Schoolroutes');
const Userroutes = require('./routes/userRoutes');
const Studentroutes = require('./routes/studentRoutes');
const superadminroutes = require('./routes/Superadminroutes');
const Courseroutes = require('./routes/Courseroutes');
const Teacheroutes = require('./routes/Teacherroutes');
const dashboardroutes =  require('./routes/dashboardroutes');
const adminroutes = require('./routes/adminroutes');
const trainerroutes = require('./routes/trainerroutes');
// const dataroutes = require('./routes/dataroutes');
// const adminroutes = require('./routes/adminroutes');
// const studentb2croutes = require('./routes/Studentb2c');
// const axios = require('axios');
// const cron = require('node-cron');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB

mongoose.connect("mongodb+srv://yssmc24:24051117@swamedha.br27l.mongodb.net/swamedha").then(() => {
    console.log('Connected to MongoDB');
}
).catch(err => {
    console.log('Failed to connect to MongoDB', err);
});


// app.use('/api/admin',adminroutes);
// app.use('/api/data', dataroutes);
app.use('/api/school', Schoolroutes);
app.use('/api/user', Userroutes);
app.use('/api/student', Studentroutes);
app.use('/api/superadmin', superadminroutes);
app.use('/api/course', Courseroutes);
app.use('/api/teacher', Teacheroutes);
app.use('/api/dashboard', dashboardroutes);
app.use('/api/admin', adminroutes);
app.use('/api/trainer', trainerroutes);
// app.use('/api/studentb2c', studentb2croutes);


app.listen(5000, () => {
    console.log('Server is running on port 5000');
});