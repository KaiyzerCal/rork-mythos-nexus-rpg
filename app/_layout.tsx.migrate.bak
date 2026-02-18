import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/contexts/GameContext";
import { MavisMemoryProvider } from "@/contexts/MavisMemoryContext";
import { MavisPrimeMemoryProvider } from "@/contexts/MavisPrimePersistentMemory";
import { trpc, trpcClient } from "@/lib/trpc.client";
import { initDb } from "../src/db/schema";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      try {
        initDb();
        // One-time migration: AsyncStorage -> SQLite json_store
        try {
          const r = await migrateAsyncStorageToSqliteOnce({ wipeAsyncStorage: false });
          console.log('[MIGRATION] AsyncStorage -> SQLite:', r);
        } catch (e) {
          console.warn('[MIGRATION] failed:', e);
        }
} catch (e) {
        console.warn("initDb failed:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GameProvider>
          <MavisMemoryProvider>
            <MavisPrimeMemoryProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </MavisPrimeMemoryProvider>
          </MavisMemoryProvider>
        </GameProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}



