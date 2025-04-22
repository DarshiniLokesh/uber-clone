import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "../app/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Debug logging to check state changes
  useEffect(() => {
    console.log("Success state changed:", success);
  }, [success]);

  const openPaymentSheet = async () => {
    try {
      setIsProcessing(true);
      await initializePaymentSheet();

      const { error } = await presentPaymentSheet();

      if (error) {
        console.log("Payment sheet error:", error);
        Alert.alert(`Error code: ${error.code}`, error.message);
        setIsProcessing(false);
      } else {
        console.log("Payment successful, setting success state to true");
        setSuccess(true);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment process error:", err);
      setIsProcessing(false);
      Alert.alert("Payment Error", "There was an error processing your payment");
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        intentConfiguration: {
          mode: {
            amount: parseInt(amount) * 100,
            currencyCode: "usd",
          },
          confirmHandler: async (
            paymentMethod,
            shouldSavePaymentMethod,
            intentCreationCallback,
          ) => {
            try {
              console.log("Confirm handler called");
              const { paymentIntent, customer } = await fetchAPI(
                "/(api)/(stripe)/create",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: fullName || email.split("@")[0],
                    email: email,
                    amount: amount,
                    paymentMethodId: paymentMethod.id,
                  }),
                },
              );

              if (paymentIntent.client_secret) {
                const { result } = await fetchAPI("/(api)/(stripe)/pay", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    payment_intent_id: paymentIntent.id,
                    customer_id: customer,
                    client_secret: paymentIntent.client_secret,
                  }),
                });

                if (result.client_secret) {
                  // Create ride
                  await fetchAPI("/(api)/ride/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      origin_address: userAddress,
                      destination_address: destinationAddress,
                      origin_latitude: userLatitude,
                      origin_longitude: userLongitude,
                      destination_latitude: destinationLatitude,
                      destination_longitude: destinationLongitude,
                      ride_time: rideTime.toFixed(0),
                      fare_price: parseInt(amount) * 100,
                      payment_status: "paid",
                      driver_id: driverId,
                      user_id: userId,
                    }),
                  });
                  
                  console.log("Ride created successfully");
                  
                  // Return client secret to Stripe SDK
                  intentCreationCallback({
                    clientSecret: result.client_secret,
                  });
                }
              }
            } catch (err) {
              console.error("Confirmation handler error:", err);
              Alert.alert("Error", "There was an error processing your payment");
            }
          },
        },
        returnURL: "myapp://book-ride",
      });

      if (error) {
        console.log("Init payment sheet error:", error);
        throw error;
      }
    } catch (err) {
      console.error("Initialize payment sheet error:", err);
      Alert.alert("Error", "Could not initialize payment");
    }
  };

  const handleBackHome = () => {
    setSuccess(false);
    router.push("/(root)/(tabs)/home");
  };

  return (
    <>
      <CustomButton
        title={isProcessing ? "Processing..." : "Confirm Ride"}
        className="my-10"
        onPress={openPaymentSheet}
        disabled={isProcessing}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
        backdropTransitionOutTiming={0}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={handleBackHome}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;