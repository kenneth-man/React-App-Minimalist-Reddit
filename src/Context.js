import React, { createContext, useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { collection, doc, query, addDoc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, orderBy, limit, where } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const Context = createContext();

const ContextProvider = ({ children, auth, db }) => {
    const [navbarDisplayName, setNavbarDisplayName] = useState('');
    const [homeData, setHomeData] = useState([]);
    const [commentsData, setCommentsData] = useState([]);
    const [profileData, setProfileData] = useState([]);
    const [subRedditData, setSubRedditData] = useState(null);
    const [privateChatUsers, setPrivateChatUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalShown, setIsModalShown] = useState(false);
    const provider = new GoogleAuthProvider();
    const storage = getStorage();

    //login account with google account
    const LoginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, provider);
            scrollToTop();
        } catch(error){
            console.log(error);
        }
    }

    //logout of account
    const logout = async () => {
        if(auth.currentUser){
            try {
                await signOut(auth);
                setNavbarDisplayName('');
                setHomeData([]);
                setProfileData([]);
                setSubRedditData(null);
                setPrivateChatUsers([]);
                setSearchQuery('');
            } catch(error) {
                console.log(error);
            }
        }
    }

    //check if a user already exist in the 'users' collection in firestore
    const checkUserAlreadyExists = async email => {
        try {
            const allUsers = await readAllDocuments('users');
            const userAlreadyExists = allUsers ? allUsers.find(curr => curr.email === email) : false;
            return userAlreadyExists;
        } catch(error){
            console.log(error);
        }
    }

    //scroll to top of specified DOM element
    const scrollToTop = () => {
        //prevent .Page from being overlapped by .navbar; offset position from top by 100px (bc .navbar is 100px height); scrollIntoView() doesn't allow offset positioning
        document.querySelector('.App').scrollTo({
            top: document.querySelector('.Page').offsetTop - 100,
            behavior: 'smooth'
        });
    }

    //scroll to bottom of specified DOM element
    const scrollToBottom = () => {
        const element = document.querySelector('.App');

        //scrollTo after data updates; not immediately otherwise will scroll to just before added message/post
        setTimeout(() => {
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        }, 750);
    }

    //return random index number from a range based on input array length
    const chooseRandomIndex = (dataArray) => Math.floor(Math.random() * dataArray.length);

    //convert firebase timestamp to a Date object, then to String
    const convertTimestampToDate = (timestamp, timeOnly = false) => 
        timeOnly ? 
        `${String(timestamp.toDate()).slice(16, 28)}` :
        `${String(timestamp.toDate()).slice(0, 15)} at ${String(timestamp.toDate()).slice(16, 28)}`

    //format URL slug by replacing spaces with underscore; prevents '%20' formatting
    const formatSlug = string => string.replaceAll(' ', '_');

    //generate a URL for files uploaded (e.g. images)
    const onImageChange = (eventObj, setState) => {
        if(eventObj.target.files && eventObj.target.files[0]) setState(URL.createObjectURL(eventObj.target.files[0]));
    }

    //download a blob file from firebase and get the URL, then setState
    //https://firebase.google.com/docs/storage/web/download-files
    const downloadURL = async (firebaseUrl, setState) => {
        try {
            const downloadedURL = await getDownloadURL(ref(storage, firebaseUrl));
            const xhr = new XMLHttpRequest();

            xhr.responseType = 'blob';
            xhr.onload = event => {
                const blob = xhr.response;
            };
            xhr.open('GET', downloadedURL);
            xhr.send();

            setState(downloadedURL);
        } catch(error){
            console.log(error);
        }
    }

    //if image is blob (images saved to firebase become blob automatically), download the file and setState, otherwise setState with URL
    const checkIfBlobImage = (data, setState) => {
        data.photoURL.slice(0, 3) === 'blob' ?
        downloadURL(data.photoURL, setState) :
        setState(data.photoURL);
    }

    //check if currently signed in user is the owner of a subreddit; set the local state parsed in
    const checkIsOwner = (auth, data, setState) => {
        if(auth.currentUser.uid === data.ownedByUid) setState(true);
    }

    //return a copy of the array parsed in, that is in reversed order
    const reverseArray = array => array.slice().reverse();

    //CREATE
    const createDocument = async (collectionName, dataObj) => {
        try {
            const docRef = await addDoc(collection(db, collectionName), dataObj);
            return docRef.id;
        } catch(error){
            console.log(error);
        }
    }

    //READ
    const readDocument = async (collectionName, documentId) => {
        try {
            const document = await getDoc(doc(db, collectionName, documentId));
            return document.data();
        } catch(error){
            console.log(error);
        }
    }

    //READ WITHOUT KNOWING DOC ID
    const readDocumentWoId = async (collectionName) => {
        try {
            const response = await readAllDocuments(collectionName);
            //return the currently signed in user's object in an array
            if(collectionName === 'users') return response.filter(curr => curr.uid === auth.currentUser.uid);
            return response;
        } catch(error){
            console.log(error);
        }
    }

    //READ ALL ONCE
    const readAllDocuments = async (collectionName, orderedBy = false, limit = false) => {
        try {
            let allDocuments;
            let returnArray = [];

            orderedBy ?
            (
                limit ?
                allDocuments = await getDocs(query(collection(db, collectionName), orderBy(orderedBy), limit(limit))) :
                allDocuments = await getDocs(query(collection(db, collectionName), orderBy(orderedBy)))
            ) :
            (
                limit ?
                allDocuments = await getDocs(query(collection(db, collectionName), limit(limit))) :
                allDocuments = await getDocs(query(collection(db, collectionName)))
            )

            allDocuments.forEach(doc => returnArray.push({ 
                ...doc.data(),
                id: doc.id
            }));

            return returnArray;
        } catch(error){
            console.log(error);
        }
    }

    //READ ALL ONSNAPSHOT
    const readAllDocumentsOnSnapshot = (collectionName, orderedBy, setState = false, docId = false, comments = false) => { 
        //query method used for specifying which documents you want to retrieve from a collection
        const messagesQuery = 
            docId ? 
            (
                comments ?
                query(collection(db, collectionName), where('postId', '==', docId), orderBy(orderedBy), limit(1000)) :
                query(collection(db, collectionName), where('subRedditId', '==', docId), orderBy(orderedBy), limit(1000))
            ) : 
            query(collection(db, collectionName), orderBy(orderedBy), limit(1000));

        //onSnapshot doesn't return promise and means you're attaching a permanent listener that listens for realtime updates; 'getDocs' returns promise and gets data once
        onSnapshot(messagesQuery, snapshot => {
            let returnArray = [];
            
            snapshot.forEach(doc => returnArray.push({
                ...doc.data(),
                id: doc.id 
            }))

            if(setState){
                setState(returnArray);
            } else {
                return returnArray;
            }
        });
    }

    //UPDATE
    const updateDocument = async (collectionName, documentId, key, value, overwriteField = true) => {
        try {
            let field = {};
            const existingDocumentData = await readDocument(collectionName, documentId);

            //assigning the 'key' parameter of this function, as the key for updating a field in the specified firestore document;
            //https://stackoverflow.com/questions/4244896/dynamically-access-object-property-using-variable
            overwriteField ?
            field[key] = value :
            field[key] = [...existingDocumentData[key], value];

            await updateDoc(doc(db, collectionName, documentId), field);
        } catch(error){
            console.log(error);
        }
    }

    //DELETE
    const deleteDocument = async (collectionName, documentId) => {
        try {
            await deleteDoc(doc(db, collectionName, documentId));
        } catch(error){
            console.log(error);
        }
    }

    //'onAuthStateChanged()' observer to add a user obj to 'users' collection whenever a user is signed in, only if it's their first time registering via email/signing in via google
    //using a useEffect single run because only want call the 'onAuthStateChanged()' one time on component render, otherwise it will run multiple times;
    //https://stackoverflow.com/questions/60090298/firebase-auth-onauthstatechanged-function-is-called-multiple-times-even-afte
    useEffect(() => 
        onAuthStateChanged(auth, async user => {
            if(user){
                const { uid, displayName, email, photoURL } = auth.currentUser;
                const doesUserAlreadyExist = await checkUserAlreadyExists(email);
           
                if(!doesUserAlreadyExist){
                    //if registered via email, give the user a 'diplayName' and 'photoURL'; these properties come with google accounts 
                    if(!displayName && !photoURL){
                        //doesn't cause state change of 'auth' object so doesn't rerender components that use 'auth'; 
                        //therefore, have to set 'navbarDisplayName' manually and 'createDocument' with 'auth.currentUser.displayName', '...photoURL'
                        await updateProfile(auth.currentUser, {
                            displayName: email.split('@')[0], 
                            photoURL: 'https://www.confluent.io/hub/static/6111e3c2b6434cf46ee6a207040498d5/b6d35/reddit.png'
                        });

                        setNavbarDisplayName(auth.currentUser.email.split('@')[0]);
                    } else {
                        setNavbarDisplayName(displayName);
                    }

                    //add new user's document data containing default values where needed (desc,title...)
                    const docRefId = await createDocument('users', {
                        uid,
                        displayName: auth.currentUser.displayName,
                        email,
                        photoURL: auth.currentUser.photoURL,
                        desc: '',
                        title: '',
                        postsIds: [],
                        subscribedIds: [],
                        ownedSubredditId: ''
                    });

                    //adding document id to newly created document; if key doesn't exist, 'updateDoc' creates one
                    await updateDocument('users', docRefId, 'id', docRefId, true);
                }
            } 
        })
    , [])

    //if 'searchQuery' is falsy (empty string), setState
    useEffect(() => 
        !searchQuery && 
        setIsSearching(false)
    , [searchQuery])

    return (
        <Context.Provider value={{ 
            auth, db, navbarDisplayName, homeData, commentsData, searchQuery, isSearching, isLoading, profileData, subRedditData, privateChatUsers, isModalShown,
            LoginWithGoogle, logout, createDocument, readDocument, readDocumentWoId, readAllDocuments, readAllDocumentsOnSnapshot, updateDocument, deleteDocument, 
            scrollToTop, scrollToBottom, chooseRandomIndex, convertTimestampToDate, setNavbarDisplayName, checkUserAlreadyExists, setHomeData, setCommentsData, 
            setSearchQuery, setIsSearching, setProfileData, setSubRedditData, setIsLoading, setPrivateChatUsers, formatSlug, onImageChange, setIsModalShown, downloadURL, 
            checkIfBlobImage, checkIsOwner, reverseArray }}>
            {children}
        </Context.Provider>
    )
}

export default ContextProvider;