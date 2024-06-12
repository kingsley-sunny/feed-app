import React, { Fragment, useEffect, useState } from "react";
import { io } from "socket.io-client";
import Button from "../../components/Button/Button";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Post from "../../components/Feed/Post/Post";
import Input from "../../components/Form/Input/Input";
import Loader from "../../components/Loader/Loader";
import Paginator from "../../components/Paginator/Paginator";
import { api } from "../../util/func";
import "./Feed.css";

const Feed = props => {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);
  // const navigate = useNavigate()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${api}/feed/status`, {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        });
        if (res.status === 401) {
          props.setIsAuth(false);
          throw new Error("Unauthorized User.");
        }

        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        const resData = await res.json();
        setStatus(resData.data.status);
      } catch (err) {
        catchError(err);
      }
    };

    fetchStatus();
    loadPosts();

    const socket = io(api);
    socket.on("updated-status", user => {
      setStatus(user.status);
    });

    socket.on("post", post => {
      syncPost(post);
    });

    return () => {
      socket.disconnect();
    };
  }, [props.token]);

  const syncPost = post => {
    setPosts(prevPosts => {
      let updatedPosts = [...prevPosts];
      let updatedTotalPosts = totalPosts;

      if (post.action === "create") {
        updatedPosts.push(post.data);
        updatedTotalPosts += 1;
      } else if (post.action === "update") {
        const postIndex = updatedPosts.findIndex(p => post.data.id === p.id);
        updatedPosts[postIndex] = post.data;
      } else {
        updatedPosts = updatedPosts.filter(p => p.id !== post.data.id);
        updatedTotalPosts -= 1;
      }
      setTotalPosts(updatedTotalPosts);
      return updatedPosts;
    });
  };

  const loadPosts = async direction => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }

    let page = postPage;
    if (direction === "next") {
      page++;
      setPostPage(page);
    }
    if (direction === "previous") {
      page--;
      setPostPage(page);
    }

    try {
      const res = await fetch(`${api}/feed/posts?page=${page}`, {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      });
      if (res.status !== 200) {
        throw new Error("Failed to fetch posts.");
      }
      const resData = await res.json();
      setPosts(resData.data);
      setTotalPosts(resData.metaData.totalItems);
      setPostsLoading(false);
    } catch (err) {
      catchError(err);
    }
  };

  const statusUpdateHandler = async event => {
    event.preventDefault();
    try {
      const res = await fetch(`${api}/feed/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't update status!");
      }
      const resData = await res.json();
      setStatus(resData.data.status);
    } catch (err) {
      catchError(err);
    }
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = postId => {
    const loadedPost = { ...posts.find(p => p.id === postId) };
    setIsEditing(true);
    setEditPost(loadedPost);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = async (postData, postId) => {
    setEditLoading(true);

    let url = `${api}/feed/post`;
    let method = "POST";
    if (editPost) {
      url = `${api}/feed/post/${postId}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${props.token}` },
        body: postData,
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Creating or editing a post failed!");
      }
      const resData = await res.json();

      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
    } catch (err) {
      console.log(err);
      catchError(err);
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
    }
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const deletePostHandler = async postId => {
    setPostsLoading(true);
    try {
      const res = await fetch(`${api}/feed/post/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Deleting a post failed!");
      }
      const resData = await res.json();
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      setPostsLoading(false);
    } catch (err) {
      setPostsLoading(false);
      catchError(err);
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  const catchError = error => {
    setError(error);
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
        token={props.token}
      />
      <section className='feed__status'>
        <form onSubmit={statusUpdateHandler}>
          <Input
            type='text'
            placeholder='Your status'
            control='input'
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode='flat' type='submit'>
            Update
          </Button>
        </form>
      </section>
      <section className='feed__control'>
        <Button mode='raised' design='accent' onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className='feed'>
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts("previous")}
            onNext={() => loadPosts("next")}
            lastPage={Math.ceil(totalPosts / 3)}
            currentPage={postPage}
          >
            {posts?.map(post => (
              <Post
                key={post.id}
                id={post.id}
                author={post.creator}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post.id)}
                onDelete={() => deletePostHandler(post.id)}
                userId={props.userId}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};

export default Feed;
