import axios from 'axios';
import './App.css';
import Home from './pages/Home';
import AddNewPost from './pages/AddNewPost';
import MyClaps from './pages/MyClaps';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  AppBar,
  Toolbar,
  Button,
  ButtonGroup,
  Alert,
  Snackbar,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import HomeIcon from '@mui/icons-material/Home';
import FloatingMenu from './components/FloatingMenu';

function App() {
  const baseURL = 'http://localhost:3080';
  const popularityOptions = [1, 5, 20, 100];

  const [userId, setUserId] = useState('');

  const [selectedPopularityQuery, setSelectedPopularityQuery] = useState('');
  const [selectedTagQuery, setSelectedTagQuery] = useState('');

  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
    
  const [claps, setClaps] = useState(0);
  const [clapsList, setClapsList] = useState([]);

  const [tags, setTags] = useState({});
  const [tagsList, setTagsList] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);

  const [alertMsg, setAlertMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        handleAlert('', false, '');
      }, 1500);
    }
  }, [showAlert]);

  const handleAlert = (message, isShow, type) => {
    setAlertMsg(message);
    setShowAlert(isShow);
    setAlertType(type);
  };

  ///////////////////////////////////// data request /////////////////////////////////////
  axios.defaults.withCredentials = true;
  ///////////////////// get request /////////////////////

  // sets a userId cookie
  const getUser = useCallback(() => {
    axios
      .get(`${baseURL}/user`)
      .then((response) => {
        setUserId(response.data.id);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

  // get all posts
  const getPosts = useCallback(() => {
    axios
      .get(`${baseURL}/posts`)
      .then((response) => {
        setAllPosts([...response.data['Posts']]);
        setFilteredPosts([...response.data['Posts']]);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

  // get filtered posts
  const getFilteredPosts = (popularity, tagName) => {
    const url = popularity !== '' ? `popularity=${popularity}` : `tag=${tagName}`;
    axios
      .get(`${baseURL}/posts?${url}`)
      .then((response) => {
        setFilteredPosts([...response.data['Posts']]);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };

  // get all tags
  const getTags = useCallback(() => {
    axios
      .get(`${baseURL}/tags`)
      .then((response) => {
        setTags({ ...response.data['Tags'] });
        const tagsList = [];
        for (const tagName in response.data['Tags']) {
          tagsList.push(tagName);
        }
        setTagsList(tagsList);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

  // get post's claps
  const getPostClaps = useCallback((postId) => {
    axios
      .get(`${baseURL}/posts/${postId}/claps`)
      .then((response) => {
        setClaps(response.data.claps);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

  // get the number of claps of the user
  const getClaps = useCallback(() => {
    axios
      .get(`${baseURL}/claps`)
      .then((response) => {
        setClaps({ ...response.data['Claps'] });
        const clapsList = [];
        for (const clap in response.data['Claps']) {
          clapsList.push(clap);
        }
        setClaps(clapsList);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);      

  useEffect(() => {
    getPosts();
    getTags();
    getUser();
    getClaps();
  }, [getPosts, getTags, getUser, getClaps]);

  ///////////////////// post request /////////////////////
  // add a post
  const addPost = (title, content, tagName) => {
    axios
      .post(
        `${baseURL}/posts`,
        {
            title,
            content,
            tagName,
        },
        {
          headers: {
            // to send a request with a body as json you need to use this 'content-type'
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then((response) => {
        const newPost = response.data['Post'];
        setAllPosts([...allPosts, newPost]);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      }
      );
  };

  // add a tag
  const addNewTag = (tagName) => {
    axios
      .post(`${baseURL}/tags`,
      {
        tagName
      },
      {
        headers: {
          // to send a request with a body as json you need to use this 'content-type'
          'content-type': 'application/x-www-form-urlencoded',
          }
      })
      .then((response) => {
        setTags({ ...response.data['Tags'] });
        const tagsList = [];
        for (const tagName in response.data['Tags']) {
          tagsList.push(tagName);
        }
        setTagsList(tagsList);
        handleAlert('Tag was added successfully', true, 'success');
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };

  // add tag to a post
  const addTagToPost = (tagName, postId) => {
    axios
      .post
      (
        `${baseURL}/posts/${postId}/tags`,
        {
          tagName,
          postId
        },
        {
          headers: {
            // to send a request with a body as json you need to use this 'content-type'
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      ).catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };
  
  // add post to the list of tags according to the tags it has
  const addPostToTagList = (tagName, postId) => {
    axios
    .post
    (
      `${baseURL}/tags/tagName/${tagName}`,
      {
        tagName,
        postId
      },
      {
        headers: {
          // to send a request with a body as json you need to use this 'content-type'
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    ).catch((error) => {
      handleAlert(error.message, true, 'error');
    });
  };

  // action to do when clap icon is clicked
  const handleClapClick = (postId, userId) => {
    axios
    .post(
      `${baseURL}/posts/${postId}`,{
        postId,
        userId
      },
      {
        headers: {
          // to send a request with a body as json you need to use this 'content-type'
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    )
    .catch((error) => {
      handleAlert(error.message, true, 'error');
    });        
}; 

// action to do when clap is clicked with regard to the user that clapped
const handleUserClapClick = (userId, postId) => {
  axios
    .post(
      `${baseURL}/claps`,
      {
        userId,
        postId
      },
      {
        headers: {
          // to send a request with a body as json you need to use this 'content-type'
          'content-type': 'application/x-www-form-urlencoded',
        },
      })
    .catch((error) => {
      handleAlert(error.message, true, 'error');
    });
  };

  ///////////////////////////////////// handle click events /////////////////////////////////////
  const handlePopularityClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (selectedOption) => {
    setAnchorEl(null);
    filterPostsByPopularity(selectedOption);
  };

  const handleHomeClick = () => {
    setFilteredPosts(allPosts);
  };

  const handleTagClick = (tagName) => {
    filterPostsByTag(tagName);
  };

  ///////////////////////////////////// filters /////////////////////////////////////
  const filterPostsByPopularity = (minClapsNum) => {
    setSelectedPopularityQuery(`${minClapsNum}`);
    getFilteredPosts(minClapsNum, selectedTagQuery);
  };

  const filterPostsByTag = (tagName) => {
    setSelectedTagQuery(`${tagName}`);
    getFilteredPosts(selectedPopularityQuery, tagName);
  };

  ///////////////////////////////////// render components /////////////////////////////////////
  const renderToolBar = () => {
    return (
      <AppBar position='sticky' color='inherit'>
        <Toolbar>
          <ButtonGroup variant='text' aria-label='text button group'>
            <Button
              href='/'
              size='large'
              onClick={handleHomeClick}
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            <Button
              href='/add-new-post'
              size='large'
              startIcon={<AddCircleIcon />}
            >
              Add A New Post
            </Button>
            <Button
              href='/my-claps'
              size='large'
              data-testid='myClapsBtn'
              startIcon={<AddCircleIcon />}
            >
              My Claps
            </Button>
          </ButtonGroup>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Enter 2023 Blog Exam
          </Typography>
          <ButtonGroup variant='text' aria-label='text button group'>
            <Button
              size='large'
              startIcon={<FilterAltIcon />}
              onClick={(e) => handlePopularityClick(e)}
              data-testid='popularityBtn'
              className={
                window.location.href !== 'http://localhost:3000/add-new-post'
                  ? ''
                  : 'visibilityHidden'
              }
            >
              filter by Popularity
            </Button>
          </ButtonGroup>
          <FloatingMenu
            menuOptions={popularityOptions}
            anchorElement={anchorEl}
            handleMenuClose={handleMenuClose}
          />
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <div className='App'>
      {renderToolBar()}
      {showAlert && (
        <Snackbar open={true} data-testid='alert-snackbar'>
          <Alert severity={alertType} data-testid='alert'>
            {alertMsg}
          </Alert>
        </Snackbar>
      )}
      <Router>
        <Routes>
          <Route
            path='/add-new-post'
            element=
              {<AddNewPost 
                handleAddPost={addPost}
                tagsList={tagsList}
              />
          }
          />
          <Route
            path='/'
            element={
              <Home
                Posts={filteredPosts}
                Tags={tags}
                tagsList={tagsList}
                Claps={claps}
                clapsList={clapsList}
                getPostClaps={getPostClaps}
                addTagToPost={addTagToPost}
                addPostToTagList={addPostToTagList}
                handleTagClick={handleTagClick}
                handleAddNewTag={addNewTag}
                selectedTagId={selectedTagId}
                selectedPopularityQuery={selectedPopularityQuery}
                selectedTagQuery={selectedTagQuery}
                handleUserClapClick={handleUserClapClick}
                handleClapClick={handleClapClick}
                userId={userId}
              />
            }
          />
          <Route
            path='/my-claps'
            element={
              <MyClaps
                Posts={filteredPosts}
                Tags={tags}
                tagsList={tagsList}
                Claps={claps}
                clapsList={clapsList}
                getPostClaps={getPostClaps}
                addTagToPost={addTagToPost}
                addPostToTagList={addPostToTagList}
                handleTagClick={handleTagClick}
                handleAddNewTag={addNewTag}
                selectedTagId={selectedTagId}
                selectedPopularityQuery={selectedPopularityQuery}
                selectedTagQuery={selectedTagQuery}
                handleUserClapClick={handleUserClapClick}
                handleClapClick={handleClapClick}
                userId={userId}
              />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}
export default App;
