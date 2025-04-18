import { Driver, MarkerData } from "../app/types/type"

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
        id: driver.driver_id,
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
    markers,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  }: {
    markers: MarkerData[];
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
  }) => {
    // Early return if required coordinates are missing, but return the original markers
    if (
      !userLatitude ||
      !userLongitude ||
      !destinationLatitude ||
      !destinationLongitude
    ) {
      console.warn("Missing coordinates for driver time calculation");
      return markers.map(marker => ({
        ...marker,
        time: 10, // Default 10 minutes
        price: "15.00" // Default $15
      }));
    }
  
    try {
      const timesPromises = markers.map(async (marker) => {
        try {
          // First API call to get time from driver to user
          const responseToUser = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
          );
          const dataToUser = await responseToUser.json();
          
          // Check if the response has valid routes
          if (!dataToUser.routes || dataToUser.routes.length === 0 || !dataToUser.routes[0].legs) {
            throw new Error("Invalid response from Google Directions API (to user)");
          }
          
          const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds
  
          // Second API call to get time from user to destination
          const responseToDestination = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
          );
          const dataToDestination = await responseToDestination.json();
          
          // Check if the response has valid routes
          if (!dataToDestination.routes || dataToDestination.routes.length === 0 || !dataToDestination.routes[0].legs) {
            throw new Error("Invalid response from Google Directions API (to destination)");
          }
          
          const timeToDestination = dataToDestination.routes[0].legs[0].duration.value; // Time in seconds
  
          const totalTime = Math.round((timeToUser + timeToDestination) / 60); // Total time in minutes, rounded
          const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time
  
          return { ...marker, time: totalTime, price };
        } catch (markerError) {
          // Handle errors for individual markers without failing the entire batch
          console.error(`Error calculating time for marker ${marker.id}:`, markerError);
          return {
            ...marker,
            time: 10, // Default 10 minutes
            price: "15.00" // Default $15
          };
        }
      });
  
      const results = await Promise.all(timesPromises);
      return results;
    } catch (error) {
      console.error("Error calculating driver times:", error);
      // Return markers with default values rather than undefined
      return markers.map(marker => ({
        ...marker,
        time: 10, // Default 10 minutes
        price: "15.00" // Default $15
      }));
    }
  };