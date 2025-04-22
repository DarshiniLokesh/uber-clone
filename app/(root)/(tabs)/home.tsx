import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { Text, View, SafeAreaView, Image, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { icons } from "@/app/constants";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "../../../components/Map";
import { useLocationStore } from "@/store";
import { useState, useEffect } from "react";
import {router} from "expo-router";
import { useFetch } from "@/lib/fetch";



export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { user } = useUser();
  const {data:recentRides, loading } = useFetch(`/(api)/ride/${user?.id}`);
  const {signOut} =  useAuth();
  const [hasPermission, setHasPermission] = useState(false);

  const handleSignOut = () => {
    signOut();

    router.replace('/(auth)/sign-in');
  };
  const handleDestinationPress = (location:{latitude:number, longitude:number, address: string}) => {
    setDestinationLocation(location);

    router.push("/(root)/find-ride");
  };

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        setUserLocation({
          latitude: 37.78825,
          longitude: -122.4324,
          address: `${address[0].name}, ${address[0].region}`,
        });
      }
    };

    requestLocation();
  }, []);

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image source={images.noResult} className="w-40 h-40" alt="No recent rides found" resizeMode="contain" />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-xl font-JakartaExtraBold">
                Welcome {user?.firstName || user?.emailAddresses[0]?.emailAddress.split("@")[0]} 👋
              </Text>
              <TouchableOpacity onPress={handleSignOut} className="justify-center items-center w-10 h-10 rounded-full bg-white">
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>
            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />
            <Text className="text-xl font-JakartaBold mt-5 mb-3">Your Current Location</Text>
            <View className="flex flex-row items-center bg-transparent h-[300px]">
              <Map />
            </View>
            <Text className="text-xl font-JakartaBold mt-5 mb-3">Recent Rides</Text>
          </>
        )}
      />
    </SafeAreaView>
  );
}
