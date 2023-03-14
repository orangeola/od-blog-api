const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: { type: String, required: true, maxLength: 32},
    text: { type: String, required: true, maxLength: 100},
    date: { type: Date, required: true},
    post: { type: Schema.Types.ObjectId, required: true, ref: 'Post'}
})

module.exports = mongoose.model('Comment', CommentSchema);