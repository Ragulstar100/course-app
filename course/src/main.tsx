import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/build/esm/styles.css'
import './index.css'
import App from './App'


const i18n = {
  locale: 'en-US',
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider i18n={i18n}>
        <App/>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
