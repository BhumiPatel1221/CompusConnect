const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database:', mongoose.connection.name);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Collections in database:');
        collections.forEach(col => console.log(`   - ${col.name}`));

        // Count events
        const Event = require('./models/Event');
        const eventCount = await Event.countDocuments();
        console.log(`\n📊 Total events in database: ${eventCount}`);

        // Get all events
        const events = await Event.find().limit(5);
        console.log('\n📋 Recent events:');
        events.forEach(event => {
            console.log(`   - ${event.title} (ID: ${event._id})`);
        });

        mongoose.connection.close();
        console.log('\n✅ Test completed');
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
