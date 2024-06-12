import React from "react";

import Button from "../../Button/Button";
import "./Post.css";

const post = props => {
  console.log("🚀 ~~ post ~~ props:", props);

  return (
    <article className='post'>
      <header className='post__header'>
        <h3 className='post__meta'>
          Posted by {props.author?.name} on {props.date}
        </h3>
        <h1 className='post__title'>{props.title}</h1>
      </header>
      {/* <div className="post__image">
      <Image imageUrl={props.image} contain />
    </div>
    <div className="post__content">{props.content}</div> */}
      <div className='post__actions'>
        <Button mode='flat' link={`/${props.id}`}>
          View
        </Button>
        {props.author?.id === Number(props.userId) && (
          <>
            <Button mode='flat' onClick={props.onStartEdit}>
              Edit
            </Button>
            <Button mode='flat' design='danger' onClick={props.onDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
    </article>
  );
};

export default post;
