import { Avatar } from 'antd';
import FeatherIcon from 'feather-icons-react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logOut } from '../../../redux/authentication/actionCreator';
import { Popover } from '../../popup/popup';
import { InfoWraper, UserDropDwon } from './auth-info-style';

function AuthInfo() {
  const dispatch = useDispatch();
  const SignOut = e => {
    e.preventDefault();
    dispatch(logOut());
  };

  const userContent = (
    <UserDropDwon>
      <div className="user-dropdwon">
        <Link className="user-dropdwon__bottomAction" onClick={SignOut} to="#">
          <FeatherIcon icon="log-out" /> Sign Out
        </Link>
      </div>
    </UserDropDwon>
  );

  return (
    <InfoWraper>
      <div className="nav-author">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="head-example">
            <Avatar src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" />
          </Link>
        </Popover>
      </div>
    </InfoWraper>
  );
}

export default AuthInfo;
