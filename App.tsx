import React from 'react'
import StackNavigate from './src/Navigation/Stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import { webClientId } from './Config';
GoogleSignin.configure({
  webClientId: webClientId, // Get this from your Firebase console
});
function App() {
  return (
    <StackNavigate/>
  )
}

export default App
