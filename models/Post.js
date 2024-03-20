const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: {
    type: String,
    required: [true, "Post can not be empty"],
  },
  username: {
    type: String,
    unique: true,
    required: {
      values: true,
      message: "please provide your name",
    },
  },
  createdAt: {
    type:String,
    default: new Date().toISOString()
  },
});

module.exports = model('Post', postSchema);