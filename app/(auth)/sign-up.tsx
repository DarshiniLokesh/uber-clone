import { Text, ScrollView, View, Image } from 'react-native';
import {images, icons} from "../constants"
import InputField from '../../components/InputField';
import { useState } from 'react';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';
import OAuth from '../../components/OAuth';
import { useSignUp } from '@clerk/clerk-expo'

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp()

  const [form ,  setForm] = useState( {
    name:"",
    email:"",
    password:"",
  });

  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: ''
  });

// Handle submission of sign-up form
    const onSignUpPress = async () => {
      if (!isLoaded) return
  
      // Start sign-up process using email and password provided
      try {
        await signUp.create({
          emailAddress: form.email,
          password: form.password,
        })
  
        // Send user an email with verification code
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
  
        // Set 'pendingVerification' to true to display second form
        // and capture OTP code
        setVerification({
          ...verification,

          state: 'pending'
        })
      } catch (err) {
        console.error(JSON.stringify(err, null, 2))
      }
    }
  
    // Handle submission of verification form
    const onVerifyPress = async () => {
      if (!isLoaded) return
  
      try {
        // Use the code the user provided to attempt verification
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

          {/* Verificatiion Modal*/}

      </View>

    </ScrollView>
  )
}


export default SignUp;