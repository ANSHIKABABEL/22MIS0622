import axios from "axios";

const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

const credentials = {
  "email": "anshika.babel2022@vitstudent.ac.in",
  "name": "anshika babel",
  "rollNo": "22mis0622",
  "accessCode": "SfFuWg",
  "clientID": "0b7f62bc-8ff5-4eae-b7cc-dd25858e8da4",
  "clientSecret": "SSFfkkYGZnKJpUDc"
}
let token = "";

async function getToken() {
  if (token) return token;

  const response = await axios.post(AUTH_URL, credentials);

  token = response.data.access_token;

  return token;
}

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
) {
  try {
    const accessToken = await getToken();

    await axios.post(
      LOG_URL,
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  } catch (error) {}
}