// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageProvider } from './contexts/PageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { XpProvider } from './contexts/XpContext';
import { UserStatsProvider } from './contexts/UserStatsContext';
import { LoadingProvider } from './contexts/LoadingContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserStatsProvider>
              <PageProvider>
                <XpProvider>
                    <QueryClientProvider client={queryClient}>
                      <App />
                    </QueryClientProvider>
                </XpProvider>
              </PageProvider>
          </UserStatsProvider> 
        </AuthProvider>
      </ThemeProvider>
    </LoadingProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
