const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require('cors');

const { baseUrl, maxNumOfClapsPerUserPerPost } = require('../constants');
const { Posts } = require('./model/Posts');
const { Tags } = require('./model/Tags');
const { Claps } = require('./model/Claps');

const app = express();
const port = 3080;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

const corsOptions = {
  origin: `${baseUrl.client}`,
  credentials: true,
};

app.get('/', cors(corsOptions), (req, res) => {
  res.send('Welcome to your Wix Enter exam!');
});

app.get('/user', cors(corsOptions), (req, res) => {
  const userId = req.cookies?.userId || uuidv4();
  res.cookie('userId', userId).send({ id: userId });
});

///////////////////////////////////// Posts /////////////////////////////////////

// get all the posts
app.get('/posts', cors(corsOptions), (req, res) => {
    // TODO - implement tags & popularity filter functionality here
    if (req.query.tag && req.query.popularity) {
      const tag = req.query.tag;
      const popularity = Number(req.query.popularity);
      const filteredPosts = Posts.filter((post) => {
        if (post.tags.includes(tag) && post.claps >= popularity) {
          return true;
        }
      })
      res.send({ Posts: filteredPosts });
      return;
      // End of TODO
    }
  else if (req.query.popularity) {
    // TODO - implement popularity filter functionality here
    const popularity = Number(req.query.popularity);
    const filteredPosts = Posts.filter((post) => {
      if (post.claps >= popularity) {
        return true;
      }
    })
    res.send({ Posts: filteredPosts });
    return;
    // End of TODO
  }
  // TODO - implement tags filter functionality here
  else if (req.query.tag) {
    const tag = req.query.tag;
    const filteredPosts = Posts.filter((post) => {
      if (post.tags.includes(tag)) {
        return true;
      }
    })
    res.send({ Posts: filteredPosts });
    return;
    // End of TODO
  }

  res.send({ Posts });
});

// get the post by id
app.get('/posts/:postId', cors(corsOptions), (req, res) => {
  const { postId } = req.params;
  const post = Posts.find((post) => post.id === postId);
  if (!post) {
    res.status(404).end();
    return;
  }
  res.send({ Posts: [post] });
});

// get the post tags list
app.get('/posts/:postId/tags', cors(corsOptions), (req, res) => {
  const { postId } = req.params;
  const post = Posts.find((post) => post.id === postId);
  if (!post) {
    res.status(404).end();
    return;
  }
  res.send({ Tags: post.tags });
});

// add a tag to the post
app.post('/posts/:postId/tags', cors(corsOptions), (req, res) => {
  const { postId } = req.body;
  const post = Posts.find((post) => post.id === postId);
  if (!post) {
    res.status(404).end();
    return;
  }
  const { tagName } = req.body;
  if (!post.tags.includes(tagName)) {
    post.tags.push(tagName);
    res.send({ Tags: post.tags });
    return;
  }
  res.status(400).end();
});

// get the post claps count
app.get('/posts/:postId/claps', cors(corsOptions), (req, res) => {
  const { postId } = req.params;
  const post = Posts.find((post) => post.id === postId);
  if (!post) {
    res.status(404).end();
    return;
  }
  res.send({ Claps: Number(post.claps) });
});

// update the post clap count, and adds the userId to the post's clapped userId list
app.post('/posts/:postId', cors(corsOptions), (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const post = Posts.find((post) => post.id === postId);
  if (!post) {
    res.status(404).end();
    return;
  }
  post.claps += 1;
  if(!post.userId.includes(userId)){
    post.userId.push(userId);
  }
  res.send({ Posts: [post] });
});

// add a new post
app.post('/posts', cors(corsOptions), (req, res) => {
  // TODO - add the add-new-post functionality here
  const userId = req.cookies?.userId;
  if (!userId) {
    res.status(403).end();
    return;
  }
  const { title, content, tagName } = req.body;
  const newPost = {
    id: uuidv4(),
    title,
    content,
    claps: 0,
    tags: [],
    userId: [],
  };
  newPost.tags.push(tagName);
  Tags[tagName][newPost.id] = true;
  Posts.push(newPost);
  res.send({ Posts }).status(200).end();
  // End of TODO
});

///////////////////////////////////// Tags /////////////////////////////////////
// get the tags list
app.get('/tags', cors(corsOptions), (req, res) => {
  res.send({ Tags });
});

// get the tag by name
app.get('/tags/tagName/:tagName', cors(corsOptions), (req, res) => {
  const { tagName } = req.params;
  res.send({ Tags: Tags[tagName] }).status(200).end();
});

// add a new tag
app.post('/tags', cors(corsOptions), (req, res) => {
  const { tagName } = req.body;
  if (Tags[tagName]) {
    const { postId } = req.body;
    if (Tags[tagName][postId]) {
      res.status(200).end();
      return;
    }
    else{
      Tags[tagName][postId] = true;
      res.status(400).end();
      return;
    }
  }
  else{
    Tags[tagName] = {};
    res.send({ Tags }).status(200).end();
  }
});

// add post to taglist
app.post('/tags/tagName/:tagName', cors(corsOptions), (req, res) => {
  const { tagName, postId } = req.body;
  if (Tags[tagName][postId]) {
    res.status(200).end();
    return;
  }
  else{
    Tags[tagName][postId] = true;
    res.status(200).end();
    return;
  }
  });

///////////////////////////////////// Claps ////////////////////////////////////
// gets the number of claps made by user
app.get('/claps', cors(corsOptions), (req, res) => {
  res.send({ Claps });
});

// updates the claps made by user, if number of claps is greater than max number of claps, will stay the same
app.post('/claps', cors(corsOptions), (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(403).end();
    return;
  }
  if (Claps[userId]) {
    // check if user clapped more than 5 times
    if (Claps[userId] >= maxNumOfClapsPerUserPerPost) {
      res.status(200).end();
      return;
    }
    else{
      Claps[userId] += 1;
      res.send({ Claps }).status(200).end();
      return;
    }
  }
  else{
    Claps[userId] = 1;
  }

  res.send({ Claps }).status(200).end();
  return;
});

/////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
