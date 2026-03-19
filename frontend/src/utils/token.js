// 1. Tokens aur Role dono ko ek saath save karein
export const setTokens = (access, refresh, role) => {
  if (access) {
    localStorage.setItem("accessToken", access);
  }
  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }
  if (role) {
    localStorage.setItem("userRole", role);
  }
};

// 2. Access Token nikalne ke liye
export const getAccessToken = () => localStorage.getItem("accessToken");

export const getRefreshToken = () => localStorage.getItem("refreshToken");

// 3. User Role nikalne ke liye (AuthCheck ke waqt kaam aayega)
export const getUserRole = () => localStorage.getItem("userRole");

// 4. Logout ke waqt saara data clean karein
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole"); // Role ko delete karna zaroori hai
};
