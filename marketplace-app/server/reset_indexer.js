require('./config/loadEnv');
const mongoose = require('mongoose');

async function reset() {
    await mongoose.connect(process.env.MONGO_URI);
    const IndexerState = require('./models/IndexerState');
    await IndexerState.deleteMany({});
    console.log("IndexerState cleared.");
    process.exit(0);
}
reset();
