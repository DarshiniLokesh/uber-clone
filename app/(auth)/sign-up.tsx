import { Text, ScrollView, View, Image, Alert } from 'react-native';
import {images, icons} from "../constants"
import InputField from '../../components/InputField';
import { useState } from 'react';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import OAuth from '../../components/OAuth';
import { useSignUp } from '@clerk/clerk-expo'
import Modal, { ReactNativeModal } from 'react-native-modal';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp()

  const [form ,  setForm] = useState( {
    name:"",
    email:"",
    password:"",
  });

  const [verification, setVerification] = useState({
    state: "",
    error: '',
    code: ''
  });


    const onSignUpPress = async () => {
      if (!isLoaded) return
  
      
      try {
        await signUp.create({
          emailAddress: form.email,
          password: form.password,
        })
  
       
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
  
        
        setVerification({
          ...verification,

          state: 'pending'
        })
      } catch (err: any) {
        Alert.alert('Error', err.errors[0]?.longMessage || 'An error occurred')
      }
    }

    const onVerifyPress = async () => {
      if (!isLoaded) return
  
      try {

        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verification.code,
        })
  
        
        if (completeSignUp.status === 'complete') {
          //TODO; Create a database user!
          await setActive({ session: completeSignUp.createdSessionId })
          setVerification({...verification, state:'success'})
        } else {
          
          setVerification({...verification,error:'Verification Failed', state:'failed'})
        }
      } catch (err:any) {
        
        setVerification({
          ...verification,
          error: err.errors[0].longMessage,
          state: "failed",
        })
      }
    }
  
   
  
  
  return (
    <ScrollView className="flex-1 bg-white ">
      <View className='flex-1 bg-white'>
        <View className="relative w-full h-[250px]">
          <Image
          source = {images.signUpCar} className='z-0 w-full h-[250px]' />
        </View>
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Create your Account
        </Text>
      </View>
      <View className="p-5">

      <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
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

          <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6" />

          <OAuth />

          <Link href="/sign-in" className="text-lg text-center text-general-200 mt-10">
            <Text className="text-center mt-4 text-gray-500">
              Already have an account? <Text className="text-primary-500">Log in</Text>
            </Text>
          </Link>

          <ReactNativeModal isVisible={verification.state === "pending"}
          onModalHide={()=> setVerification({
            ...verification,
            state:"success",})}>
              <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                <Text className='text-2xl font-JakartaBold mb-2'> Verification</Text>
                <Text className='font-Jakarta mb-5'> We've sent a verification email to {form.email}</Text>

                <InputField 
                label="Code"
                icon={icons.lock}
                placeholder="12345"
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(value)=>
                  setVerification({
                    ...verification,
                    code: value
                  })
                }
                />

                {verification.error && (
                  <Text className="text-red-500 text-sm mt-1">
                    {verification.error}
                  </Text>
                )}

                <CustomButton title='Verify Email' onPress={onVerifyPress} className='mt-5 bg-success-500'/>
              </View>
          </ReactNativeModal>

        <ReactNativeModal isVisible={verification.state === 'success'}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image source = {images.check} className = "w-[110px] h-[110px] mx-auto my-5"/>

            <Text className="text-3xl font-JakartaBold text-center">
              Verified
              </Text>
              <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                You have successfully verified your account
              </Text>

              <CustomButton title="Browse Home" onPress={() => router.replace('/(root)/(tabs)/home')} className="mt-5" />

          </View>
        </ReactNativeModal>

      </View>

    </ScrollView>
  )
}


export default SignUp;