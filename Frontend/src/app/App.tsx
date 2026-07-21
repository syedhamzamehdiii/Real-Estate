import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ListingsProvider } from '../context/ListingsContext'
import { ResourcesProvider } from '../context/ResourcesContext'
import { AppRouter } from './router'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ListingsProvider>
          <ResourcesProvider>
            <AppRouter />
          </ResourcesProvider>
        </ListingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
