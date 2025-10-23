import "../global.css";
import { Slot, Stack, Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ClerkProvider } from "@clerk/clerk-expo";

// Type assertion to handle React 19 compatibility with Clerk
const TypedClerkProvider = ClerkProvider as any;

export default function Layout() {
  return (
    <TypedClerkProvider tokenCache={tokenCache}>
      <Slot />
    </TypedClerkProvider>
  );
}
