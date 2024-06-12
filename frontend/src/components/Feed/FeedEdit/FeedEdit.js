import React, { Fragment, useEffect, useState } from "react";

import { generateBase64FromImage } from "../../../util/image";
import { length, required } from "../../../util/validators";
import Backdrop from "../../Backdrop/Backdrop";
import FilePicker from "../../Form/Input/FilePicker";
import Input from "../../Form/Input/Input";
import Image from "../../Image/Image";
import Modal from "../../Modal/Modal";

const POST_FORM = {
  title: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
  image: {
    value: "",
    valid: false,
    touched: false,
    validators: [required],
  },
  content: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
};

const FeedEdit = props => {
  const [postForm, setPostForm] = useState(POST_FORM);
  const [formIsValid, setFormIsValid] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (props.editing && props.selectedPost) {
      const postForm = {
        title: {
          ...POST_FORM.title,
          value: props.selectedPost.title,
          valid: true,
        },
        image: {
          ...POST_FORM.image,
          value: props.selectedPost.imageUrl,
          valid: true,
        },
        content: {
          ...POST_FORM.content,
          value: props.selectedPost.content,
          valid: true,
        },
      };
      setPostForm(postForm);
      setFormIsValid(true);
    }
  }, [props.editing, props.selectedPost]);

  const postInputChangeHandler = (input, value, files) => {
    if (files) {
      generateBase64FromImage(files[0])
        .then(b64 => {
          setImagePreview(b64);
        })
        .catch(e => {
          setImagePreview(null);
        });
    }
    setPostForm(prevState => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value: files ? files[0] : value,
        },
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }

      return {
        ...updatedForm,
      };
    });
    setFormIsValid(Object.keys(postForm).every(inputName => postForm[inputName].valid));
  };

  const inputBlurHandler = input => {
    setPostForm(prevState => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true,
      },
    }));
  };

  const cancelPostChangeHandler = () => {
    setPostForm(POST_FORM);
    setFormIsValid(false);
    props.onCancelEdit();
  };

  const acceptPostChangeHandler = async () => {
    const post = {
      title: postForm.title.value,
      image: postForm.image.value,
      content: postForm.content.value,
    };
    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("content", post.content);
    formData.append("image", post.image);

    let postId;
    if (props.selectedPost) {
      postId = props.selectedPost.id;
    }

    props.onFinishEdit(formData, postId);
    setPostForm(POST_FORM);
    setFormIsValid(false);
    setImagePreview(null);
  };

  return props.editing ? (
    <Fragment>
      <Backdrop onClick={cancelPostChangeHandler} />
      <Modal
        title='New Post'
        acceptEnabled={formIsValid}
        onCancelModal={cancelPostChangeHandler}
        onAcceptModal={acceptPostChangeHandler}
        isLoading={props.loading}
      >
        <form>
          <Input
            id='title'
            label='Title'
            control='input'
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("title")}
            valid={postForm["title"].valid}
            touched={postForm["title"].touched}
            value={postForm["title"].value}
          />
          <FilePicker
            id='image'
            label='Image'
            control='input'
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("image")}
            valid={postForm["image"].valid}
            touched={postForm["image"].touched}
          />
          <div className='new-post__preview-image'>
            {!imagePreview && <p>Please choose an image.</p>}
            {imagePreview && <Image imageUrl={imagePreview} contain left />}
          </div>
          <Input
            id='content'
            label='Content'
            control='textarea'
            rows='5'
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("content")}
            valid={postForm["content"].valid}
            touched={postForm["content"].touched}
            value={postForm["content"].value}
          />
        </form>
      </Modal>
    </Fragment>
  ) : null;
};

export default FeedEdit;
