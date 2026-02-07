<<<<<<< HEAD
import { Home, Flame, Target, Users, Cpu } from "lucide-react-native";
import React from "react";

import { Tabs } from "expo-router";
import { installRorkUnifiedPersistence } from "../../lib/rork-unified-persistence";
installRorkUnifiedPersistence();
=======
import { Tabs } from "expo-router";
import { Home, Flame, Target, Users, Package, TowerControl, Zap, Search, Medal, Sparkles, BookLock, Cpu, CheckSquare } from "lucide-react-native";
import React from "react";
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#08C284",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0A0A0A",
          borderTopColor: "#08C284",
          borderTopWidth: 1,
          paddingBottom: 4,
<<<<<<< HEAD
          height: 60},
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600"}}}
=======
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
<<<<<<< HEAD
          tabBarIcon: ({ color }) => <Home size={22} color={color} />}}
=======
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
      />
      <Tabs.Screen
        name="transformations"
        options={{
          title: "Forms",
<<<<<<< HEAD
          tabBarIcon: ({ color }) => <Flame size={22} color={color} />}}
=======
          tabBarIcon: ({ color }) => <Flame size={22} color={color} />,
        }}
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: "Quests",
<<<<<<< HEAD
          tabBarIcon: ({ color }) => <Target size={22} color={color} />}}
=======
          tabBarIcon: ({ color }) => <Target size={22} color={color} />,
        }}
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
      />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen
        name="councils"
        options={{
          title: "Councils",
<<<<<<< HEAD
          tabBarIcon: ({ color }) => <Users size={22} color={color} />}}
=======
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
      />
      <Tabs.Screen
        name="mavis"
        options={{
          title: "MAVIS",
<<<<<<< HEAD
          tabBarIcon: ({ color }) => <Cpu size={22} color={color} />}}
=======
          tabBarIcon: ({ color }) => <Cpu size={22} color={color} />,
        }}
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
      />
      <Tabs.Screen name="inventory" options={{ href: null }} />
      <Tabs.Screen name="scouter" options={{ href: null }} />
      <Tabs.Screen name="rankings" options={{ href: null }} />
      <Tabs.Screen name="tower" options={{ href: null }} />
      <Tabs.Screen name="energy" options={{ href: null }} />
      <Tabs.Screen name="all-skills" options={{ href: null }} />
      <Tabs.Screen name="vault-codex" options={{ href: null }} />
      <Tabs.Screen name="bpm" options={{ href: null }} />
      <Tabs.Screen name="skills" options={{ href: null }} />
      <Tabs.Screen name="allies" options={{ href: null }} />
      <Tabs.Screen name="rituals" options={{ href: null }} />
      <Tabs.Screen name="store" options={{ href: null }} />
      <Tabs.Screen name="memory-codex" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="codex" options={{ href: null }} />
      <Tabs.Screen name="character" options={{ href: null }} />
      <Tabs.Screen name="forms" options={{ href: null }} />
    </Tabs>
  );
}
<<<<<<< HEAD



=======
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
