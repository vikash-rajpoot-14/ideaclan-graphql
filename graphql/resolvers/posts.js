const { GraphQLError }= require('graphql');
const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const User = require('../../models/User');

module.exports = {
  Query: {
    async getAllPosts(){
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getOwnPosts(_,args,context) {
        const user = checkAuth(context);
         const username = user.username;
      try {
        const posts = await Post.find({ username }).sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {

      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error('Post not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPostOfFollowers(_,args,context){
        const user = checkAuth(context);
        const username = user.username;
        const followeduser = await User.findOne({username}).populate('follow').select('follow');
        let post = [];
        for(let userObj of followeduser.follow) {
            const UserPosts = await Post.find({username: userObj.username})
            post = post.concat(UserPosts)
        }
        const sortedPosts = post.sort((a, b) => {
            return b.createdAt - a.createdAt
          });

        return sortedPosts ;
    }
  },
  Mutation: {
    async createPost(_, { body }, context) {

      const user = checkAuth(context);

      if (body.trim() === '') {
        throw new Error('Post body must not be empty');
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      });

      const post = await newPost.save();

      return post;
    },
// DELETING POST
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await Post.findByIdAndDelete(postId);
          return 'Post deleted successfully';
        } else {
            throw new GraphQLError("Action not allowed", {
                extensions: {
                    code: 'USER_INPUT_ERROR',
                },
            });
        }
      } catch (err) {
        throw new GraphQLError(err, {
            extensions: {
                code: `error while deleting post ${err.message}`,
            },
        });

      }
    },
 }
}