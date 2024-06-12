import React, { useCallback, useState } from "react";

import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input/Input";
import { email, length, required } from "../../util/validators";
import Auth from "./Auth";

const Login = props => {
  const [loginForm, setLoginForm] = useState({
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
    formIsValid: false,
  });

  const inputChangeHandler = useCallback((input, value) => {
    setLoginForm(prevState => {
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
    setLoginForm(prevState => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true,
      },
    }));
  }, []);

  return (
    <Auth>
      <form
        onSubmit={e =>
          props.onLogin(e, {
            email: loginForm.email.value,
            password: loginForm.password.value,
          })
        }
      >
        <Input
          id='email'
          label='Your E-Mail'
          type='email'
          control='input'
          onChange={(id, value) => inputChangeHandler(id, value)}
          onBlur={(id, value) => inputBlurHandler(id, value)}
          value={loginForm["email"].value}
          valid={loginForm["email"]?.valid}
          touched={loginForm["email"].touched}
        />
        <Input
          id='password'
          label='Password'
          type='password'
          control='input'
          onChange={(id, value) => inputChangeHandler(id, value)}
          onBlur={(id, value) => inputBlurHandler(id, value)}
          value={loginForm["password"].value}
          valid={loginForm["password"]?.valid}
          touched={loginForm["password"].touched}
        />
        <Button design='raised' type='submit' loading={props.loading}>
          Login
        </Button>
      </form>
    </Auth>
  );
};

export default Login;
