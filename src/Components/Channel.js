import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../Context';
import { Timestamp } from 'firebase/firestore'; 
import Post from './Post';
import Message from './Message';
import NoData from './NoData';

const Channel = ({ component, collection, sortBy, reverseOrder, matchToId }) => {
    const { auth, db, readAllDocumentsOnSnapshot, createDocument, scrollToBottom, reverseArray, updateDocument, commentsData } = useContext(Context);
    const [channelData, setChannelData] = useState([]);
    const [textInput, setTextInput] = useState('');

    const handleOnSubmit = async eventObj => {
        eventObj.preventDefault();

        const { uid, displayName, photoURL } = auth.currentUser;
        
        const trimmedData = textInput.trim();

        if(trimmedData && db) {
            //Add a new document to specific 'collection' from prop, to Firestore
            if(component === 'Message'){
                await createDocument(collection, {
                    text: trimmedData,
                    createdAt: Timestamp.now(),
                    uid,
                    displayName,
                    photoURL
                }) 
            }
           
            if(component === 'Comment'){
                const docId = await createDocument(collection, {
                    text: trimmedData,
                    createdAt: Timestamp.now(),
                    uid,
                    displayName,
                    photoURL
                })

                //updating 'comments' collection by adding comment doc id to newly created document
                await updateDocument(collection, docId, 'id', docId);
                //updating 'comments collection by adding post doc id (the post that the comment is on) to newly created document
                await updateDocument(collection, docId, 'postId', matchToId);
                //updating 'posts' collection with added comment doc id in 'commentsIds
                await updateDocument('posts', commentsData.id, 'commentsIds', docId, false);
            }

            //Clear input field
            setTextInput('');
        }
    };

    useEffect(() => {
        if(db) {
            matchToId ? 
            (
                collection === 'comments' ?
                readAllDocumentsOnSnapshot(collection, sortBy, setChannelData, matchToId, true) :
                readAllDocumentsOnSnapshot(collection, sortBy, setChannelData, matchToId)
            ) : 
            readAllDocumentsOnSnapshot(collection, sortBy, setChannelData);
            
            //useEffect cleanup function called every render to prevent error caused by dismounting before async call finished, resulting in memory leak
            return () => setChannelData([]);
        }
    }, [db])

    return (
        <div className='Page channel col fw'>
            <div className='Page channel__cont col fw'>
                {
                    channelData.length > 0 ?
                    (
                        component === 'Message' || component === 'Comment' ?
                        channelData.map(curr => 
                            <Message
                                key={curr.id}
                                msgData={curr}
                                collection={collection}
                            />  
                        ) :
                        (
                            reverseOrder ?
                            reverseArray(channelData).map(curr =>
                                <Post
                                    key={curr.id}
                                    postData={curr}
                                    collection={collection}
                                    onSubReddit={matchToId}
                                />     
                            ) :  
                            channelData.map(curr =>
                                <Post
                                    key={curr.id}
                                    postData={curr}
                                    collection={collection}
                                    onSubReddit={matchToId}
                                />    
                            )    
                        )
                    ) :
                    <NoData text={`No ${component}s Data found...`}/>    
                }  
            </div>

            {
                component === 'Message' || component === 'Comment' ?
                <form onSubmit={collection ? e => handleOnSubmit(e) : null} className='Page__section--smallest channel__form row fw'>
                    <textarea
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        placeholder={`Type your ${component.toLowerCase()} text here...`}
                    />

                    <div className='row'>
                        <button id='channel__input--cancel' onClick={() => setTextInput('')}>
                            Cancel
                        </button>

                        <button id='channel__input--submit' type='submit' disabled={!textInput} onClick={scrollToBottom}>
                            Send
                        </button>
                    </div>
                </form> :
                null
            }
        </div>
    )
}

export default Channel;