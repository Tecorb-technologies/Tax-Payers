import axios from "axios"

// Base URL is provided via Vite env (see .env.example). In dev, the Vite
// server proxy also forwards /api to the backend, so the "/api" fallback
// works even without a .env file present.
const baseURL = import.meta.env.VITE_API_URL || "/api"

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Every backend response body is shaped `{ data, meta? }` (see
// backend/src/controllers/*). This unwraps that envelope so pages can work
// directly with the payload.
export async function getData(url, config) {
  const response = await api.get(url, config)
  return response.data?.data
}

// Backend errors are shaped `{ error: { message, details? } }`. Normalize
// any axios/network/backend error down to a single user-facing string.
export function getErrorMessage(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  )
}

export default api
