import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Image from "../../../components/Image/Image";
import { API } from "../../../util/func";
import "./SinglePost.css";

const SinglePost = props => {
  const [post, setPost] = useState({
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  });
  const { postId } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API}/feed/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        });

        if (response.status === 401) {
          props.setIsAuth(false);
          throw new Error("Unauthorized User.");
        }

        if (response.status !== 200) {
          throw new Error("Failed to fetch post");
        }
        const resData = await response.json();
        setPost({
          title: resData.data.title,
          author: resData.data.creator.name, // Assuming author is always Sunny; adjust if necessary
          date: new Date(resData.data.createdAt).toLocaleDateString("en-US"),
          image: resData.data.imageUrl,
          content: resData.data.content,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [postId, props.token]);

  return (
    <section className='single-post'>
      <h1>{post.title}</h1>
      <h2>
        Created by {post.author} on {post.date}
      </h2>
      <div className='single-post__image'>
        <Image contain imageUrl={post.image} />
      </div>
      <p>{post.content}</p>
    </section>
  );
};

export default SinglePost;
