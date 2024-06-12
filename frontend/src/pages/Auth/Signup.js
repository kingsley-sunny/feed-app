import React, { useCallback, useState } from "react";

import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input/Input";
import { email, length, required } from "../../util/validators";
import Auth from "./Auth";

const Signup = props => {
  const [signupForm, setSignupForm] = useState({
    email: {
      value: "",
      valid: false,
      touched: false,
      validators: [required, email],
    },
    password: {
      value: "",
      valid: false,
      touched: false,
      validators: [required, length({ min: 5 })],
    },
    name: {
      value: "",
      valid: false,
      touched: false,
      validators: [required],
    },
    formIsValid: false,
  });

  const inputChangeHandler = useCallback((input, value) => {
    setSignupForm(prevState => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value: value,
        },
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName]?.valid;
      }
      return {
        ...updatedForm,
        formIsValid: formIsValid,
      };
    });
  }, []);

  const inputBlurHandler = useCallback(input => {
    setSignupForm(prevState => {
      return {
        ...prevState,
        [input]: {
          ...prevState[input],
          touched: true,
        },
      };
    });
  }, []);

  return (
    <Auth>
      <form onSubmit={e => props.onSignup(e, signupForm)}>
        <Input
          id='email'
          label='Your E-Mail'
          type='email'
          control='input'
          onChange={(id, value) => inputChangeHandler(id, value)}
          onBlur={(id, value) => inputBlurHandler(id, value)}
          value={signupForm.email.value}
          valid={signupForm.email.valid}
          touched={signupForm.email.touched}
        />
        <Input
          id='name'
          label='Your Name'
          type='text'
          control='input'
          onChange={(id, value) => inputChangeHandler(id, value)}
          onBlur={(id, value) => inputBlurHandler(id, value)}
          value={signupForm.name.value}
          valid={signupForm.name.valid}
          touched={signupForm.name.touched}
        />
        <Input
          id='password'
          label='Password'
          type='password'
          control='input'
          onChange={(id, value) => inputChangeHandler(id, value)}
          onBlur={(id, value) => inputBlurHandler(id, value)}
          value={signupForm.password.value}
          valid={signupForm.password.valid}
          touched={signupForm.password.touched}
        />
        <Button design='raised' type='submit' loading={props.loading}>
          Signup
        </Button>
      </form>
    </Auth>
  );
};

export default Signup;
