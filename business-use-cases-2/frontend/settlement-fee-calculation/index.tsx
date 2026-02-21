import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Connect } from '@stacks/connect-react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Connect
      authOptions={{
        appDetails: {
          name: 'Stacks DApp',
          icon: window.location.origin + '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          window.location.reload();
        },
      }}
    >
      <App />
    </Connect>
  </React.StrictMode>
);
