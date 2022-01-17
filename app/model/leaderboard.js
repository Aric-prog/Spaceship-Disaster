const mongoose = require('mongoose')

const LeaderboardSchema = new mongoose.Schema({
    team_name: {type: String, required: true},
    time: {type: Number, required: true},
    round: {type: Number, required: true}
},
{collection: 'leaderboards'}
)

const model = mongoose.model('LeaderboardSchema', LeaderboardSchema)

module.exports = model