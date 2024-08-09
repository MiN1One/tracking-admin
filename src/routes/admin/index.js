import { Spin } from 'antd';
import React, { Suspense } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import withAdminLayout from '../../layout/withAdminLayout';
import Tracking from '../tracking';
import Dashboard from './dashboard';

const Admin = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Suspense
        fallback={
          <div className="spin">
            <Spin />
          </div>
        }
      >
        <Route path={path} component={Dashboard} />
        <Route path={`${path}/tracking`} component={Tracking} />
      </Suspense>
    </Switch>
  );
};

export default withAdminLayout(Admin);
