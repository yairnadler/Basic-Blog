import { List } from '@mui/material';
import Post from '../components/Post';

function MyClaps({
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
}

) {

    const myClapsPosts = Posts.filter((post) => post.userId.includes(userId));

    return (
        <div className='container'>
            <List sx={{ width: '650px' }}>
                {}
                {myClapsPosts.map((post) => (
                    <Post
                        postId={post.id}
                        postTitle={post.title}
                        postContent={post.content}
                        postClaps={post.claps}
                        Tags={Tags}
                        addTagToPost={addTagToPost}
                        addPostToTagList={addPostToTagList}
                        handleUserClapClick={handleUserClapClick}
                        handleClapClick={handleClapClick}
                        getPostClaps={getPostClaps}
                        userId={userId}
                        handleTagClick={handleTagClick}
                        selectedTagId={selectedTagId}
                    />
                ))}
            </List>
        </div>
  );
}

export default MyClaps;