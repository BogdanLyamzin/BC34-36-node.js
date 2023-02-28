import {useSelector, useDispatch} from "react-redux";

import LoginForm from "../../modules/LoginForm/LoginFormForm";

import { login } from "../../redux/auth/auth-operations";

import { getAuthError } from "../../redux/auth/auth-selectors";

const LoginPage = () => {
  const dispatch = useDispatch();
  const {status, message} = useSelector(getAuthError);

  const onLogin = (data) => {
      dispatch(login(data));
  }

  return (
    <div className="container">
      <h2>Login Page</h2>
      <LoginForm onSubmit={onLogin} />
      {status && <p style={{color: "red"}}>{message}</p>}
    </div>
  );
};

export default LoginPage;