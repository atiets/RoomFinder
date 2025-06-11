// redux/subscriptionAPI.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

export const subscriptionAPI = createApi({
  reducerPath: 'subscriptionAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: '/v1/subscriptions',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.login?.currentUser?.accessToken;
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['TransactionHistory', 'CurrentSubscription'],
  endpoints: (builder) => ({
    getTransactionHistory: builder.query({
      query: (userId) => `/history/${userId}`,
      providesTags: ['TransactionHistory'],
    }),
    getCurrentSubscription: builder.query({
      query: (userId) => `/current/${userId}`,
      providesTags: ['CurrentSubscription'],
    }),
  }),
});

export const { 
  useGetTransactionHistoryQuery, 
  useGetCurrentSubscriptionQuery 
} = subscriptionAPI;

const API_BASE_URL = process.env.REACT_APP_BASE_URL_API;

export const getTransactionHistory = async (userId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/v1/subscriptions/history/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCurrentSubscription = async (userId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/subscriptions/current/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};