import { migrateAsyncStorageToSqliteOnce } from "../src/db/migrations/migrateAsyncStorageToSqliteOnce";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/contexts/GameContext";
import { MavisMemoryProvider } from "@/contexts/MavisMemoryContext";
import { MavisPrimeMemoryProvider } from "@/contexts/MavisPrimePersistentMemory";
import { trpc, trpcClient } from "@/lib/trpc.client";
import { initDb } from "../src/db/schema";
import * as Updates from "expo-updates";

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        initDb();

        // ✅ Run migration BEFORE providers mount
        try {
          const r = await migrateAsyncStorageToSqliteOnce({ wipeAsyncStorage: false });
          console.log("[MIGRATION] AsyncStorage -> SQLite:", r);
        } catch (e) {
          console.warn("[MIGRATION] failed:", e);
        }

        // ✅ OTA update last (so it doesn't interrupt init/migration)
        try {
          if (!__DEV__) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
              return;
            }
          }
        } catch (e) {
          console.warn("[UPDATES] check/fetch/reload failed:", e);
        }

        setReady(true);
      } catch (e) {
        console.warn("initDb failed:", e);
        setReady(true); // fail open so you can still see UI
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (!ready) return null;

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
