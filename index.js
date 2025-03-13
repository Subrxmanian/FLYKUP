/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import  'react-native-url-polyfill/auto'
// import { Blob, File, XMLHttpRequest } from 'react-native-blob-util';
// Install the polyfill first
// npm install react-native-blob-util

// Add this to your index.js or early in your app initialization
// import { polyfill } from 'react-native-blob-util';
// polyfill();

// global.Blob = Blob;
// global.File = File;
// global.XMLHttpRequest = XMLHttpRequest;

AppRegistry.registerComponent(appName, () => App);
