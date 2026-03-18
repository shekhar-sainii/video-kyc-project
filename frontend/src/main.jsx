import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './App';
import { store } from './app/store';
import './styles/index.css';
import ErrorBoundary from './error/ErrorBoundary';
import AuthProvider from './auth/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </Provider>
      </ErrorBoundary>
  </React.StrictMode>
);
