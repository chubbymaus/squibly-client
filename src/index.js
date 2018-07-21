import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import 'semantic-ui-css/semantic.min.css';

import Routes from './routes/index';
import registerServiceWorker from './registerServiceWorker';
import client from './apollo';



const App = () => (
  <ApolloProvider client={client}>
    <Routes />
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));
registerServiceWorker();
