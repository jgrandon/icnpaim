import Dashboard from './components/pages/dashboard';
import TestPage from './components/pages/testPage';

import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import parameters from './util/parameters';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

const queryParams = queryString.parse(location.search);
let params = parameters.getInstance();

if (queryParams) {
  const nonce = queryParams.nonce;
  params.setNonce(nonce);
  //console.log(`app.js nonce ${nonce}`);
}

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      {/*<Route path='/' component={Dashboard}/>*/}
      <Route path='/' component={TestPage}/>
    </Switch>
  </BrowserRouter>, document.getElementById('root'));
