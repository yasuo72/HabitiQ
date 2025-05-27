// Client-side authentication utilities

// Save token to localStorage and as a cookie
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    
    // Also set as a cookie for server-side access
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    console.log('Token set in both localStorage and cookie');
  }
};

// Get token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Remove token from localStorage and cookies
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Also remove the cookie
    document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
  }
};

// Save user data to localStorage
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Get user data from localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!getToken();
  }
  return false;
};

// Logout user
export const logout = async () => {
  try {
    // Get user ID before removing token
    const user = getUser();
    const userId = user?._id || user?.id;
    console.log(`Logging out user: ${userId || 'unknown'}`);
    
    // Import storage utils and clear user data
    const { storageUtils } = await import('./storage');
    if (userId && storageUtils.clearUserData) {
      console.log('Clearing user-specific data');
      storageUtils.clearUserData();
    }
    
    // Remove authentication tokens
    removeToken();
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during logout:', error);
    // Fallback to basic logout if there's an error
    removeToken();
    window.location.href = '/login';
  }
};
