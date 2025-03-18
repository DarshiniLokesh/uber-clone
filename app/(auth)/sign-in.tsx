import { Text, ScrollView, View, Image } from 'react-native';
import {images, icons} from "../constants"
import InputField from '../../components/InputField';
import { useState, useCallback } from 'react';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';
import OAuth from '../../components/OAuth';
import { useSignIn } from "@clerk/clerk-expo";


const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
       
      } else {
       
      }
    } catch (err: any) {
    
    }
  }, [isLoaded, form]);
  
  return (
    <ScrollView className="flex-1 bg-white ">
      <View className='flex-1 bg-white'>
        <View className="relative w-full h-[250px]">
          <Image
          source = {images.signUpCar} className='z-0 w-full h-[250px]' />
        </View>
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Welcome
        </Text>
      </View>
      <View className="p-5">

     
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton title="Sign In" onPress={onSignInPress} className="mt-6" />

          <OAuth />

          <Link href="/sign-up" className="text-lg text-center text-general-200 mt-10">
            <Text className="text-center mt-4 text-gray-500">
             Dont have an Account <Text className="text-primary-500">Sign Up</Text>
            </Text>
          </Link>

          {/* Verificatiion Modal*/}

      </View>

    </ScrollView>
  )
}





export default SignIn;