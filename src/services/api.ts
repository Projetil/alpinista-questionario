import axios from "axios";

const baseApiUrl = process.env.NEXT_URL_API;

export const api = axios.create({
  baseURL: baseApiUrl,
  timeout: 10000,
});
