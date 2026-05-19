import { createContext, useContext, useState, useEffect } from 'react'
import { pb } from './pb'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.isValid ? pb.authStore.model : null)

  useEffect(() => {
    return pb.authStore.onChange((token, model) => {
      setUser(model)
    })
  }, [])

  async function login(username, password) {
    const auth = await pb.collection('users').authWithPassword(username, password)
    if (!auth.record.is_active) {
      pb.authStore.clear()
      throw new Error('Account is disabled')
    }
    return auth.record
  }

  function logout() {
    pb.authStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: pb.authStore.isValid,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
