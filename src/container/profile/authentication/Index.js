import { Center } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

const AuthLayout = (WraperContent) => {
  return function () {
    const token = useSelector((({ auth }) => auth.login));

    if (token) {
      return <Redirect to="/admin" />;
    }

    return (
      <Center minHeight="100vh">
        <WraperContent />
      </Center>
    );
  };
};

export default AuthLayout;
