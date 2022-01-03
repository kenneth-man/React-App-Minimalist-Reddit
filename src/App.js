import React, { useState } from 'react';
import './App.css';
import ContextProvider from './Context';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import GlobalChat from './Pages/GlobalChat';
import PrivateChat from './Pages/PrivateChat';
import Profile from './Pages/Profile';
import Comments from './Pages/Comments';
import SubReddit from './Pages/SubReddit';
import NavBar from './Components/NavBar';
//firebase sdk; 
//1) create project on firebase.com, add the sign in methods you require
//2) enable firestore api and create firstore database on google cloud platform
//3) update database rules (permissions) https://stackoverflow.com/questions/46590155/firestore-permission-denied-missing-or-insufficient-permissions
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyA-9NvTZbs6sxaY01m9VwEAfBLKvAnKg6s",
  authDomain: "minimalist-reddit.firebaseapp.com",
  projectId: "minimalist-reddit",
  storageBucket: "minimalist-reddit.appspot.com",
  messagingSenderId: "88150319442",
  appId: "1:88150319442:web:6be5b964a3ba934a645a8b",
  measurementId: "G-ZZY5TRJ4YW"
});

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function App() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  //onAuthStateChanged parses a 'user' object in the callback function if signed in, otherwise 'user' is null; 'auth.currentUser' is same as 'user'
  onAuthStateChanged(auth, user => user ? setIsUserSignedIn(true) : setIsUserSignedIn(false));

  return (
    <div className='App col'>
      <ContextProvider auth={auth} db={db}>
        <BrowserRouter>
          {isUserSignedIn ? <NavBar/> : null}

          <Routes>
            <Route path='/' exact element={isUserSignedIn ? <Home/> : <Login/>}/>
            <Route path='/Register' exact element={<Register/>}/>
            <Route path='/GlobalChat' exact element={<GlobalChat/>}/>
            <Route path='/PrivateChat' exact element={<PrivateChat/>}/>
            <Route path='/Profile' exact element={<Profile/>}/>
            <Route path='/Comments/:postId' exact element={<Comments/>}/>
            <Route path='/SubReddit/:subredditName' exact element={<SubReddit/>}/>
          </Routes>
        </BrowserRouter>
      </ContextProvider>
    </div>
  );
}

export default App;