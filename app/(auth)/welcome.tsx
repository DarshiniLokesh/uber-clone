import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { onboarding} from '../constants'; // Import from constants folder

const Onboarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full flex-row justify-between items-center p-5">
        <View className="flex-1">
          <Text className="text-2xl font-JakartaBold">
            {onboarding[currentIndex].title}
          </Text>
          <Text className="text-gray-600 mt-2">
            {onboarding[currentIndex].description}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
          <Text className="text-black text-md font-JakartaBold ml-4">Skip</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-1">
        <Swiper 
          ref={swiperRef}
          loop={false}
          dot={<View className="w-2 h-2 bg-gray-300 rounded-full mx-1" />}
          activeDot={<View className="w-2 h-2 bg-black rounded-full mx-1" />}
          paginationStyle={{ bottom: 30 }}
          onIndexChanged={(index) => setCurrentIndex(index)}
        >
          {onboarding.map((_, index) => (
            <View key={`slide-${index}`} className="flex-1 justify-center items-center">
              {/* Empty view for swiper slides - content is displayed above */}
            </View>
          ))}
        </Swiper>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;