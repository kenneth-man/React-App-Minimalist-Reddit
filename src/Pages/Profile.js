import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../Context';
import { Link } from 'react-router-dom';
import Banner from '../Components/Banner';
import Modal from '../Components/Modal';
import Post from '../Components/Post';
import NoData from '../Components/NoData';
import LoadingGif from '../Res/Images/loading.gif';
import { BannerImageData } from '../DataFiles/BannerImageData';

const Profile = () => {
    const { auth, db, profileData, setProfileData, logout, chooseRandomIndex, scrollToTop, setPrivateChatUsers,
        updateDocument, readDocumentWoId, readAllDocuments, isModalShown, setIsModalShown, checkIfBlobImage } = useContext(Context);
    //###UPLOAD IMG CODE###
    // const [displayImage, setDisplayImage] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editImagePath, setEditImagePath] = useState('');
    const [recentUserPosts, setRecentUserPosts] = useState([]);
    const isCurrUserProfile = auth.currentUser ? auth.currentUser.uid === profileData.uid : null;

    const logoutOnClick = async () => {
        await logout();
        scrollToTop();
    }

    const privateChatOnClick = () => {
        const privateChatUids = [auth.currentUser.uid, profileData.uid];

        //collection name sorted by alphabetical order of uids, so whoever initiates private chat convo, won't create 2 diff collections 
        const sortedPrivateChatUids = privateChatUids.sort();

        setPrivateChatUsers(sortedPrivateChatUids.map((curr, index) => 
            ({
                uid: curr,
                name: sortedPrivateChatUids[index] === auth.currentUser.uid ? auth.currentUser.displayName : profileData.displayName
            })
        ))
    }

    const editCloseOnClick = () => {
        scrollToTop();
        setIsModalShown(false);
        setEditTitle('');
        setEditDescription('');
        setEditImagePath('');
    }

    const editSaveOnSubmit = async eventObj => {
        eventObj.preventDefault();

        const currentUser = await readDocumentWoId('users');

        const editInputs = [
            { 
                state: editTitle,
                key: 'title'
            }, 
            {
                state: editDescription,
                key: 'desc'
            },
            {
                state: editImagePath,
                key: 'photoURL'
            }
        ];

        const editInputsChanged = editInputs.filter(curr => curr.state !== '');

        //looping async functions; using 'reduce' because 'forEach' doesn't wait for async functions to complete
        await editInputsChanged.reduce(async (acc,curr,index) => {
            //waits for previous items to complete
            await acc;

            //get the next item
            await updateDocument('users', currentUser[0].id, curr.key, curr.state, true);
            
            //if last element in array, empty 'profileData' to trigger useEffect, async 'readDocumentWoId' to get updated data from firebase
            if(index === editInputsChanged.length - 1) setProfileData([]);
        }, Promise.resolve());
        
        editCloseOnClick();
    }

    const updateRecentUserPosts = (array) => {
        //only need the 3 latest posts, ordered from most recent to less recent
        const postsCreatedByUser = array.filter(curr => curr.createdByUid === profileData.uid).slice(-3).reverse();
        setRecentUserPosts(postsCreatedByUser);
    }

    useEffect(async () => {
        const allUserPosts = await readAllDocuments('posts', 'createdAt');
        const allSubReddits = await readAllDocuments('subReddits');

        if(profileData.uid){
            //only show posts if subReddit it was posted in still exists (not deleted);
            //removing all posts from 'users' collection in 'SortedBy', would be too complex for the same functionality
            const postsInExistingSubReddits = allUserPosts.filter(curr => allSubReddits.find(subReddit => subReddit.id === curr.subRedditId));
            updateRecentUserPosts(postsInExistingSubReddits);
        } else {
            const updatedUserData = await readDocumentWoId('users');
            setProfileData(updatedUserData[0]);

            //###UPLOAD IMG CODE###
            //checkIfBlobImage(updatedUserData[0], setDisplayImage);
        }

        return () => setProfileData([]);
    }, [profileData])

    return (
        <div className='Page profile col fw'>
            {
                isModalShown ?
                <Modal
                    closeFunc={editCloseOnClick}
                    submitFunc={editSaveOnSubmit}
                    inputFieldsData={[
                        {
                            inputName: 'Edit title',
                            inputType: 'text',
                            inputPlaceholder: 'Type in your new title here...',
                            inputState: editTitle,
                            inputSetState: setEditTitle
                        },
                        {
                            inputName: 'Edit description',
                            inputType: 'textarea',
                            inputPlaceholder: 'Type in your new description here...',
                            inputState: editDescription,
                            inputSetState: setEditDescription
                        }
                    ]}
                    imageSetState={setEditImagePath}
                /> :
                <>
                    <div className='Page__section--medium col fw'>
                        {/* //###UPLOAD IMG CODE### */}
                        {/* <img src={displayImage ? displayImage : LoadingGif} alt='profile-img' className='profile__img'/> */}
                        <img src={profileData.photoURL ? profileData.photoURL : LoadingGif} alt='profile-img' className='profile__img'/>
                        <h1 className='bold'>{profileData.displayName}</h1>
                        <h2><span className='bold'>Email</span> &ndash; {profileData.email}</h2>
                        <h2><span className='bold'>UID</span> &ndash; {profileData.id}</h2>
                    </div>

                    <Banner image={profileData.uid && BannerImageData[chooseRandomIndex(BannerImageData)]}/>

                    <div className='Page__section--medium profile__details col fw'>
                        <h2 className='bold underline'>{profileData.title ? profileData.title : '(No Title Created)'}</h2>

                        <p>{profileData.desc ? profileData.desc : '(No Description Created)'}</p>

                        <div className='col'>
                            <h3>Posts &ndash; {profileData.postsIds ? profileData.postsIds.length : '(No Posts found)'}</h3>

                            <h3>Subscribed &ndash; {profileData.subscribedIds ? profileData.subscribedIds.length : '(No subscriptions found)'}</h3>
                        </div>   
                    </div>

                    <Banner image={profileData.uid && BannerImageData[chooseRandomIndex(BannerImageData)]}/>

                    <div className='Page__section--medium profile__posts col fw'>
                        <div className='Page__section--smallest ctr fw'>
                            <h1 className='bold'>Recent Posts</h1>
                        </div>
                        {
                            recentUserPosts.length > 0 ?
                            recentUserPosts.map((curr, index) => 
                                <Post
                                    key={index}
                                    postData={curr}
                                    collection='posts'
                                    onSubReddit={false}
                                />
                            ) :
                            <h1>This user has not created any posts...</h1>
                        }
                    </div>

                    <Banner image={profileData.uid && BannerImageData[chooseRandomIndex(BannerImageData)]}/>

                    <div className='Page__section--small row fw' style={{width: '30%'}}>
                        {
                            isCurrUserProfile &&
                            <button onClick={() => setIsModalShown(true)}>Edit Info</button> 
                        }

                        <Link 
                            to={isCurrUserProfile ? '/' : '/PrivateChat'} 
                            exact='true' 
                            onClick={isCurrUserProfile ? logoutOnClick : privateChatOnClick} 
                            className='navlink'
                        >
                            {
                                isCurrUserProfile ?
                                'Logout' :
                                'Private Chat'
                            }
                        </Link>
                    </div>
                </>
            }
        </div>
    )
}

export default Profile;