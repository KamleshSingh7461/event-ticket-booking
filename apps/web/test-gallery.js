require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Event = require('./src/models/Event').default || require('./src/models/Event');
    const ev = await Event.findOne().sort({createdAt:-1});
    console.log('Latest event:', ev.title);
    console.log('Gallery:', ev.gallery);
    console.log('Schedule:', ev.schedule);
    process.exit(0);
}).catch(console.error);
