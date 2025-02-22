import axios from "axios";
import { jwtDecode } from "jwt-decode";

const refreshToken = async () => {
  try {
    const res = await axios.post(
      "v1/auth/refresh",
      {},
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    console.log("Error in refresh token:", err);
  }
};

export const createAxios = (user, dispatch, stateSuccess) => {
  const newInstance = axios.create();
  newInstance.interceptors.request.use(
    async (config) => {
      try {
        const date = new Date();
        const decodedToken = jwtDecode(user?.accessToken);

        // Kiểm tra token hết hạn
        if (decodedToken.exp < date.getTime() / 1000) {
          const data = await refreshToken();

          const refreshUser = {
            ...user,
            accessToken: data.accessToken,
          };

          dispatch(stateSuccess(refreshUser));

          config.headers.Authorization = `Bearer ${data.accessToken}`;
        } else {
          config.headers.Authorization = `Bearer ${user?.accessToken}`;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
      return config;
    },
    (err) => Promise.reject(err),
  );
  return newInstance;
};
