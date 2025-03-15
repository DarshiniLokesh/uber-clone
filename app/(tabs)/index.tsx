import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <View className="bg-yellow-500 p-6 rounded-lg shadow-lg">
        <Text className="text-white text-xl font-bold">Tailwind is Working! 🚀</Text>
      </View>
    </SafeAreaView>
  );
}
