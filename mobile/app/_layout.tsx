import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "@/src/theme/colors";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
         <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
    <Stack
      initialRouteName="index"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="post/[id]"
        options={{
          headerShown: true,
          headerTitle: "Post",
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          animation: "simple_push",
        }}
      />
      <Stack.Screen name="post/edit/[id]" options={{ headerShown: true,
          headerTitle: "My Profile",
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          animation: "simple_push",
       }} />
    </Stack>     
            </BottomSheetModalProvider>    
    </GestureHandlerRootView>  
    </QueryClientProvider>
  );
}