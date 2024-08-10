import { ChakraProvider } from '@chakra-ui/react';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.less';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider, useSelector } from 'react-redux';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import ProtectedRoute from './components/utilities/protectedRoute';
import config from './config/config';
import store from './redux/store';
import Admin from './routes/admin';
import Auth from './routes/auth';
import './static/css/main.css';
import './static/css/style.css';

const { theme } = config;

function ProviderConfig() {
  const { rtl, isLoggedIn, topMenu, darkMode } = useSelector((state) => {
    return {
      darkMode: state.ChangeLayoutMode.data,
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
      isLoggedIn: state.auth.login,
    };
  });

  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={{ ...theme, rtl, topMenu, darkMode }}>
        <Router>
            <Route path="/" component={Auth} /> 
            <ProtectedRoute path="/admin" component={Admin} />
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <ProviderConfig />
      </ChakraProvider>
    </Provider>
  );
}

export default hot(App);
