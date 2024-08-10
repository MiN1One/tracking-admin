import { Spin } from 'antd';
import React, { Suspense } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Tracking from '../../container/map/index';
import withAdminLayout from '../../layout/withAdminLayout';

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
        <Route path={path} component={Tracking} />
      </Suspense>
    </Switch>
  );
};

export default withAdminLayout(Admin);
