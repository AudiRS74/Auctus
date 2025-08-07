import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "./index";
import Trading from "./trading";
import Charts from "./charts";
import Analysis from "./analysis";
import Settings from "./settings";
const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#10131A", borderTopColor: "#222A36" },
        tabBarActiveTintColor: "#5B86FF",
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Trading" component={Trading} />
      <Tab.Screen name="Charts" component={Charts} />
      <Tab.Screen name="Analysis" component={Analysis} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}