import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.jsx'



import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {CssBaseline} from '@mui/material'
import AppProvider from './AppProvider.jsx'

import { QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <QueryClientProvider client={queryClient}>
      <AppProvider />
      <CssBaseline />
    </QueryClientProvider>
  </StrictMode>,
)
