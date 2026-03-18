// 1. Tokens aur Role dono ko ek saath save karein
export const setTokens = (access, refresh, role) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  if (role) {
    localStorage.setItem("userRole", role);
  }
};

// 2. Access Token nikalne ke liye
export const getAccessToken = () => localStorage.getItem("accessToken");

// 3. User Role nikalne ke liye (AuthCheck ke waqt kaam aayega)
export const getUserRole = () => localStorage.getItem("userRole");

// 4. Logout ke waqt saara data clean karein
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole"); // Role ko delete karna zaroori hai
  localStorage.removeItem("theme"); // Optional: Agar theme reset karni ho toh
};