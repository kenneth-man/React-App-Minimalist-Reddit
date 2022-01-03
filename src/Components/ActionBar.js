import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../Context';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import ResultCol from './ResultCol';
import { Timestamp } from 'firebase/firestore'; 

const ActionBar = ({ subRedditId, isOwner }) => {
    const { createDocument, updateDocument, readDocumentWoId, readDocument, readAllDocuments, deleteDocument,
        isModalShown, setIsModalShown, setSubRedditData, setIsLoading } = useContext(Context);
    const [image, setImage] = useState('');
    const [nameTitle, setNameTitle] = useState('');
    const [description, setDescription] = useState('');
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const [resultColData, setResultColData] = useState([]);
    const [currentUser, setCurrentUser] = useState([]);
    const [isCurrentUserSubscribed, setIsCurrentUserSubscribed] = useState(false);
    const navigate = useNavigate();

    const editCloseOnClick = () => {
        setNameTitle('');
        setDescription('');
        setIsModalShown(false);
    }

    const subRedditDeleteOnClick = async () => {
        setIsLoading(true);
        setSubRedditData(null);

        const allUsers = await readAllDocuments('users');
        const allPosts = await readAllDocuments('posts');
        
        if(allUsers.length > 0){
            //delete document from 'subReddits' collection
            await deleteDocument('subReddits', subRedditId);

            //clear 'ownedSubredditId' property value from owner of current subReddit
            await updateDocument('users', currentUser[0].id, 'ownedSubredditId', '');

            //update 'subscribedIds' from 'users' collection
            //user objects that are subscribed to current subReddit
            const subscribedUsers = allUsers.filter(curr => curr.subscribedIds.includes(subRedditId));
            //removing current subReddit id from subscribed users
            const subscribedUsersRemovedSubIds = subscribedUsers.map(curr => curr.subscribedIds.filter(id => id !== subRedditId));
            await subscribedUsersRemovedSubIds.reduce(async (acc,curr,index) => {
                await acc;
                await updateDocument('users', subscribedUsers[index].id, 'subscribedIds', curr[index]);
            }, Promise.resolve()); 

            //delete documents in 'posts' collection that have the current 'subRedditId'
            //post objects in the subreddit that is being deleted
            const subRedditPosts = allPosts.filter(curr => curr.subRedditId === subRedditId);
            await subRedditPosts.reduce(async (acc,curr) => {
                await acc;
                await deleteDocument('posts', curr.id);
            }, Promise.resolve());

            navigate('/');
        }

        setIsLoading(false);
    }

    const subRedditSubscribeOnClick = async () => {
        //adding new subscription to 'user' by adding 'subRedditId' to 'subscribedIds' array in firebase
        await updateDocument('users', currentUser[0].id, 'subscribedIds', subRedditId, false);
        //adding new 'user' uid to 'subscribedByUids' array in firebase
        await updateDocument('subReddits', subRedditId, 'subscribedByUids', currentUser[0].uid, false);

        setIsCurrentUserSubscribed(true);
        alert('You have subscribed');
    }

    const subRedditUnsubscribeOnClick = async () => {
        //replacing 'user' 'subscribedIds' array in firebase with left out subreddit id
        const updatedSubscriptions = await currentUser[0].subscribedIds.filter(curr => curr !== subRedditId);
        await updateDocument('users', currentUser[0].id, 'subscribedIds', updatedSubscriptions);
        //replacing 'subReddits' 'subscribedByUids' array in firebase with left out uid
        const currentSubredditData = await readDocument('subReddits', subRedditId);
        const updatedSubscribedUids = currentSubredditData.subscribedByUids.filter(curr => curr !== currentUser[0].uid);
        await updateDocument('subReddits', subRedditId, 'subscribedByUids', updatedSubscribedUids);
        
        setIsCurrentUserSubscribed(false);
        alert('You have been Unsubscribed');
    }

    const checkIfUserSubscribed = () => currentUser[0].subscribedIds.includes(subRedditId) ? setIsCurrentUserSubscribed(true) : setIsCurrentUserSubscribed(false);

    const actionBarOnSubmit = async eventObj => {
        eventObj.preventDefault();

        //when creating subreddit, subReddit page is not rendered yet
        const currentUser = await readDocumentWoId('users');
        const { id, uid, displayName } = currentUser[0];
        let docRefId;

        //exit function if one of the input fields is empty
        if(!nameTitle || !description){
            alert('Please fill each text input field with a value. An image will be allocated if none are uploaded');
            editCloseOnClick();
            return;
        }

        //creating a subreddit, when using 'ActionBar' component on 'Home' page
        if(!subRedditId){
            if(currentUser[0].ownedSubredditId){
                alert('Only one subreddit can be owned per user. Delete your currently owned subreddit to create a new one');
            } else {
                docRefId = await createDocument('subReddits', {
                    photoURL: image ? image : 'https://www.logo.wine/a/logo/Reddit/Reddit-Vertical-Color-Logo.wine.svg',
                    displayName: nameTitle,
                    desc: description,
                    postsIds: [],
                    subscribedByUids: [],
                    ownedByUid:  uid,
                    ownedByName: displayName
                });

                //adding document id to newly created document
                await updateDocument('subReddits', docRefId, 'id', docRefId);

                //adding document id to the user document that owns this newly created subreddit
                await updateDocument('users', id, 'ownedSubredditId', docRefId);

                const finalInitializedData = await readDocument('subReddits', docRefId);
                setSubRedditData(finalInitializedData);

                setShouldNavigate(true);
            }
        }

        //creating a post, when using 'ActionBar' component on 'SubReddit' page
        if(subRedditId){
            docRefId = await createDocument('posts', {
                createdAt: Timestamp.now(),
                photoURL: image ? image : 'https://www.logo.wine/a/logo/Reddit/Reddit-Vertical-Color-Logo.wine.svg',
                nameTitle,
                desc: description,
                upVotes: [],
                downVotes: [],
                createdByUid: uid,
                createdByName: displayName,
                commentsIds: []
            });

            //adding the subReddit owner's uid and id to the newly created document
            const subReddit = await readDocument('subReddits', subRedditId);
            await updateDocument('posts', docRefId, 'subRedditName', subReddit.displayName);
            await updateDocument('posts', docRefId, 'subRedditOwnedByUid', subReddit.ownedByUid);
            await updateDocument('posts', docRefId, 'subRedditId', subReddit.id);

            //adding document id to the newly created document
            await updateDocument('posts', docRefId, 'id', docRefId);

            //adding document id to 'users' document array 'postsIds' that created this post
            await updateDocument('users', id, 'postsIds', docRefId, false);

            //adding document id to 'subReddits' document array 'postsIds', as the SubReddit page will display all posts for all document ids in that array
            await updateDocument('subReddits', subRedditId, 'postsIds', docRefId, false);
        }

        editCloseOnClick();
    }

    useEffect(async () => 
        shouldNavigate &&
        navigate(`/SubReddit/${nameTitle}`)
    , [shouldNavigate])

    useEffect(async () => {
        const currUser = await readDocumentWoId('users');
        setCurrentUser(currUser);

        return () => setCurrentUser([]);
    },[])

    useEffect(async () => {
        if(currentUser?.length > 0){
            checkIfUserSubscribed();
            const subscribedSubRedditIds = currentUser[0].subscribedIds;
            const allSubRedditObjs = await readAllDocuments('subReddits');
            setResultColData(allSubRedditObjs.filter(curr => subscribedSubRedditIds.find(id => id === curr.id)));
        }

        return () => setIsCurrentUserSubscribed(false);
    }, [currentUser])

    return (
        <div className='Page__section--smallest actionBar row fw'>
            {
                isModalShown ?
                <Modal
                    closeFunc={editCloseOnClick} 
                    submitFunc={actionBarOnSubmit} 
                    inputFieldsData={[
                        {
                            inputName: `Input a ${subRedditId ? 'title' : 'subreddit name'}`,
                            inputType: 'text',
                            inputPlaceholder: `Type in the new ${subRedditId ? 'title' : 'name'} here...`,
                            inputState: nameTitle,
                            inputSetState: setNameTitle
                        },
                        {
                            inputName: 'Input a description',
                            inputType: 'textarea',
                            inputPlaceholder: 'Type in the new description here...',
                            inputState: description,
                            inputSetState: setDescription
                        }
                    ]}
                    imageSetState={setImage}
                /> :
                <>
                    {
                        !subRedditId &&
                        <div className='actionBar__wrapper actionBar__wrapper--resultCol col fh'>
                            <h2>Your Subscriptions</h2>
                            {
                                resultColData.length > 0 ?
                                <ResultCol
                                    state={resultColData}
                                /> :
                                <h3 className='bold italic'>Not subscribed to any Subreddits</h3>
                            }
                        </div> 
                    }

                    <div className='actionBar__wrapper row fh'>
                        <button onClick={() => setIsModalShown(true)} className='actionBar__btn'>
                            {
                                !subRedditId ?
                                'Create subreddit' :
                                'Create post'
                            }    
                        </button>

                        {
                            subRedditId && 
                            (
                                isOwner ?
                                <button className='actionBar__btn' onClick={subRedditDeleteOnClick}>Delete subreddit</button> :
                                <button 
                                    className='actionBar__btn' 
                                    onClick={isCurrentUserSubscribed ? subRedditUnsubscribeOnClick : subRedditSubscribeOnClick
                                    }
                                >
                                    { isCurrentUserSubscribed ? 'Unsubscribe' : 'Subscribe'}
                                </button>
                            ) 
                        }  
                    </div>           
                </>
            }
        </div>
    )
}

export default ActionBar;