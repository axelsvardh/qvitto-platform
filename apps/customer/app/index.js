import { Redirect } from "expo-router";

export default function Index() {
  // Skicka användaren direkt till login-sidan
  return <Redirect href="/login" />;
}
