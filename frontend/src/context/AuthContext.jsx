// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

// Step A — Create the context bucket
// This is an empty bucket that will hold user data
const AuthContext = createContext()

// Step B — Create the Provider
// This is the component that wraps your whole app
// and makes user data available everywhere
export function AuthProvider({ children }) {

  const [user,    setUser]    = useState(null)   // stores user info like name, email, id
  const [token,   setToken]   = useState(null)   // stores the JWT login token
  const [loading, setLoading] = useState(true)   // true while checking localStorage on load

  // Step C — On app load, check if user was previously logged in
  // This runs once when the app starts
  // It reads from localStorage so the user stays logged in after refresh
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('kv_token')
      const savedUser  = localStorage.getItem('kv_user')

      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch (err) {
        console.log(err);
        
      // If localStorage data is corrupted, clear it
      localStorage.removeItem('kv_token')
      localStorage.removeItem('kv_user')
    } finally {
      setLoading(false)
    }
  }, [])

  // Step D — Login function
  // Call this after a successful API login response
  // It saves the user data and token both in state and localStorage
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('kv_token',        jwtToken)
    localStorage.setItem('kv_user', JSON.stringify(userData))
  }

  // Step E — Logout function
  // Clears everything — state and localStorage
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('kv_token')
    localStorage.removeItem('kv_user')
  }

  // Step F — Update user data
  // Useful after user edits their profile
  const updateUser = (newData) => {
    const updated = { ...user, ...newData }
    setUser(updated)
    localStorage.setItem('kv_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{
      user,           // the logged-in user object { id, email, first_name, last_name }
      token,          // the JWT token string
      loading,        // true while restoring session on app load
      isLoggedIn: !!token,  // simple boolean — true if token exists
      login,          // function to call on successful login
      logout,         // function to call on logout
      updateUser,     // function to update user data
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step G — Custom hook
// This is what you import in every component that needs auth data
// Instead of writing useContext(AuthContext) everywhere,
// you just write useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}