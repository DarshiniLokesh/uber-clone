import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";

import { icons } from "../../constants/index";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className="items-center justify-center pb-7">
    <View
      className={`w-16 h-16 rounded-full items-center justify-center ${
        focused ? "bg-general-400" : "bg-transparent"
      }`}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        className="w-8 h-8"
      />
    </View>
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#333333",
          borderRadius: 50,
          paddingBottom: 0,
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 78,
          position: "absolute",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
