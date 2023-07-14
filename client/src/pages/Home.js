import { List } from '@mui/material';
import FloatingMenu from '../components/FloatingMenu';
import TagsCloud from '../components/TagsCloud';
import Post from '../components/Post';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home({
  Posts,
  Tags,
  tagsList,
  addTagToPost,
  addPostToTagList,
  handleTagClick,
  handleAddNewTag,
  handleUserClapClick,
  handleClapClick,
  getPostClaps,
  selectedTagId,
  selectedPopularityQuery,
  selectedTagQuery,
  userId,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [anchorEl, setAnchorEl] = useState(null);

  const [selectedPostId, setSelectedPostId] = useState('')

  ///////////////////////////////////// handle query param /////////////////////////////////////
  searchParams.get('popularity');

  useEffect(() => {
    if (selectedPopularityQuery !== '') {
      setSearchParams({ popularity: `${selectedPopularityQuery}` });
    }
    if (selectedTagQuery !== '') {
      setSearchParams({ tag: `${selectedTagQuery}` });
    }
  }, [selectedPopularityQuery, selectedTagQuery, setSearchParams]);

  ///////////////////////////////////// handle tag click /////////////////////////////////////
  const handleAddTagClick = (event, selectedPostId) => {
    setSelectedPostId(selectedPostId);
    setAnchorEl(event.currentTarget);
    
  };

  const handleMenuClose = (selectedOption) => {
    addTagToPost(selectedOption, selectedPostId);
    addPostToTagList(selectedOption, selectedPostId);
    Tags[selectedOption][selectedPostId] = true;
    setAnchorEl(null);
  };

  ///////////////////////////////////// render components /////////////////////////////////////
  return (
    <div className='container'>
      <List sx={{ width: '650px' }}>
        {Posts.map((post) => (
          <Post
            postId={post.id}
            postTitle={post.title}
            postContent={post.content}
            postClaps={post.claps}
            Tags={Tags}
            addTagToPost={addTagToPost}
            addPostToTagList={addPostToTagList}
            handleAddTagClick={handleAddTagClick}
            handleUserClapClick={handleUserClapClick}
            handleClapClick={handleClapClick}
            getPostClaps={getPostClaps}
            userId={userId}
            handleTagClick={handleTagClick}
            selectedTagId={selectedTagId}
          />
        ))}
      </List>
      <TagsCloud
        tagsList={tagsList}
        handleAddNewTag={handleAddNewTag}
        selectedTagId={selectedTagId}
        handleTagClick={handleTagClick}
      />
      <FloatingMenu
        menuOptions={tagsList}
        anchorElement={anchorEl}
        handleMenuClose={handleMenuClose}
      />
    </div>
  );
}

export default Home;
