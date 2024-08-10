import { axiosClient } from '../../config/api';
import { removeItem, setItem } from '../../utility/localStorageControl';
import actions from './actions';

const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess, logoutErr } = actions;

const login = (credentials) => {
  return async (dispatch) => {
    try {
      dispatch(loginBegin());
      const { data } = await axiosClient('login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      setItem('access_token', data.token);
      return dispatch(loginSuccess(data.token));
    } catch (err) {
      console.error('Error while logging in', err);
      dispatch(loginErr(err));
    }
  };
};

const logOut = () => {
  return async (dispatch) => {
    try {
      dispatch(logoutBegin());
      removeItem('access_token');
      dispatch(logoutSuccess(null));
    } catch (err) {
      dispatch(logoutErr(err));
    }
  };
};

export { login, logOut };

