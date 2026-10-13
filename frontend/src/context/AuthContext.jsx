import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore user from sessionStorage on page reload
    try {
      const stored = sessionStorage.getItem("resumeiq_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /**
   * Call login() after the server responds successfully.
   * Stores user data + password for HTTP Basic auth interceptor.
   * The password must be kept for the lifetime of the session because
   * HTTP Basic requires it on every request Header.
   */
  const login = useCallback((userData, rawPassword) => {
    const userObject = {
      id:    userData.id,
      name:  userData.name,
      email: userData.email,
      role:  userData.role,
    };
    setUser(userObject);
    sessionStorage.setItem("resumeiq_user",  JSON.stringify(userObject));
    // Store credentials for the axios HTTP Basic interceptor
    sessionStorage.setItem("authEmail",    userObject.email);
    sessionStorage.setItem("authPassword", rawPassword);
    sessionStorage.removeItem("resumeId"); // clear previous resume selection
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("resumeiq_user");
    sessionStorage.removeItem("authEmail");
    sessionStorage.removeItem("authPassword");
    sessionStorage.removeItem("resumeId");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
