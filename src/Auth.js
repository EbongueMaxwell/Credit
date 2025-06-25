// src/auth.js

export const getToken = () => localStorage.getItem("authToken");

export const isLoggedIn = () => !!getToken();

export const logout = () => localStorage.removeItem("authToken");

export const saveToken = (token) => localStorage.setItem("authToken", token);

export const refreshToken = async () => {
  try {
    const response = await fetch("http://localhost:8000/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("authToken", data.access_token);
    return data.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    return null;
  }
};