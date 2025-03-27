import React from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { GoogleInputProps } from "@/app/types/type";

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  return (
    <TouchableOpacity 
   
      className={`flex flex-row items-center justify-between px-4 py-3 rounded-xl z-50 mb-5 ${containerStyle}`}
    >
      {icon && (
        <Image 
          source={typeof icon === 'string' ? { uri: icon } : icon} 
          className="w-5 h-5 mr-3" 
          resizeMode="contain" 
        />
      )}
      <Text className="flex-1 text-neutral-500">
        Search
      </Text>
    </TouchableOpacity>
  );
};

export default GoogleTextInput;