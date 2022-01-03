import React, { useContext, useState, useEffect, useRef } from 'react';
import { Context } from '../Context';
import { Link } from 'react-router-dom';
import Image from './Image';
import { ReactComponent as UpVoteIcon } from '../Res/Icons/arrow-bold-up.svg';
import { ReactComponent as DownVoteIcon } from '../Res/Icons/arrow-bold-down.svg';
import { ReactComponent as CommentIcon } from '../Res/Icons/chat.svg';
import { ReactComponent as DeleteIcon } from '../Res/Icons/trash.svg';

const Post = ({ postData, collection, onSubReddit }) => {
    const { convertTimestampToDate, readDocumentWoId, deleteDocument, updateDocument, readDocument, readAllDocuments, setCommentsData } = useContext(Context);
    const [currentUser, setCurrentUser] = useState([]);
    const [userPrevVotes, setUserPrevVotes] = useState({ prevUpVoted: false, prevDownVoted: false, isUpvote: false });
    const isInitialRender = useRef(true);

    const postDeleteOnClick = async () => {
        const allUsers = await readAllDocuments('users');
        const currentSubReddit = await readDocument('subReddits', postData.subRedditId);
        const filteredUserPostsIds = currentUser[0].postsIds.filter(curr => curr !== postData.id);
        const filteredSubRedditPostsIds = currentSubReddit.postsIds.filter(curr => curr !== postData.id);
        const userWhoCreatedPost = allUsers.filter(curr => curr.uid === postData.createdByUid);

        //remove document from 'posts' collection
        await deleteDocument('posts', postData.id);

        //replace 'postsIds' field value with filtered posts id array in document from 'users' collection
        await updateDocument('users', userWhoCreatedPost[0].id, 'postsIds', filteredUserPostsIds, true);

        //replace 'postsIds' field value with filtered posts id array in document from 'subReddits' collection
        await updateDocument('subReddits', postData.subRedditId, 'postsIds', filteredSubRedditPostsIds, true);
    }

    //check if the user has previously upVoted/downVoted the current post, or not voted
    const checkUserPrevVotes = () => {
        const hasUserPrevUpVoted = postData.upVotes.find(curr => curr === currentUser[0].uid);
        const hasUserPrevDownVoted = postData.downVotes.find(curr => curr === currentUser[0].uid);
        let initialRenderIsUpVoted = hasUserPrevUpVoted ? true : ( hasUserPrevDownVoted ? false : 'no-vote' );

        return { 
            hasUserPrevUpVoted, 
            hasUserPrevDownVoted, 
            initialRenderIsUpVoted 
        };
    }

    //function called whenever the upVote or downVote buttons are clicked
    const voteOnClick = async isUpvote => {
        isInitialRender.current = false;
    
        const { hasUserPrevUpVoted, hasUserPrevDownVoted } = checkUserPrevVotes();

        setUserPrevVotes(
            { 
                prevUpVoted: hasUserPrevUpVoted, 
                prevDownVoted: hasUserPrevDownVoted, 
                isUpvote 
            }
        );
    }

    const updateVotes = async (voteProp, isRemove = true) => {
        let updatingVotesArray;
        
        voteProp === 'upVotes' ?
        (
            updatingVotesArray = isRemove ? postData.upVotes.filter(curr => curr !== currentUser[0].uid) : postData.upVotes.concat(currentUser[0].uid)
        ) :
        (
            updatingVotesArray = isRemove ? postData.downVotes.filter(curr => curr !== currentUser[0].uid) : postData.downVotes.concat(currentUser[0].uid)
        );
       
        await updateDocument('posts', postData.id, voteProp, updatingVotesArray);
    }

    useEffect(async () => {
        const currUser = await readDocumentWoId('users');
        setCurrentUser(currUser);
    }, [])

    //on component render, get currently signed in user's previous vote, or no vote (e.g. if previously upVoted, upVoted icon will be coloured)
    useEffect(() => {
        if(currentUser.length > 0){
            const { hasUserPrevUpVoted, hasUserPrevDownVoted, initialRenderIsUpVoted } = checkUserPrevVotes();

            setUserPrevVotes(
                { 
                    prevUpVoted: hasUserPrevUpVoted, 
                    prevDownVoted: hasUserPrevDownVoted, 
                    isUpvote: initialRenderIsUpVoted 
                }
            );
        }
    }, [currentUser])

    useEffect(async () => {
        if(!isInitialRender.current){
            if(userPrevVotes.isUpvote){
                if(userPrevVotes.prevUpVoted){
                    await updateVotes('upVotes');
                } else {
                    await updateVotes('downVotes');
                    await updateVotes('upVotes', false);
                }
            } else {
                if(userPrevVotes.prevDownVoted){
                    await updateVotes('downVotes');
                } else {
                    await updateVotes('upVotes');
                    await updateVotes('downVotes', false);
                }
            }
        }
    }, [userPrevVotes])

    return (
        <div className='post col'>
            <Image image={postData.photoURL} className='subReddit__img'/>
            <h1>{postData.nameTitle}</h1>
            <p>{postData.desc}</p>
            <h2>
                <span className='bold italic'>
                    {postData.createdByName}
                </span> 
                &nbsp;
                wrote in the subreddit
                &nbsp;
                <span className='bold italic'>
                    {postData.subRedditName}
                </span> 
            </h2>
            <h2>
                on the
                &nbsp;
                <span className='bold italic'>
                    {convertTimestampToDate(postData.createdAt)}
                </span>
            </h2>
            <div className='Page__section-smallest ctr'>
                <Link to={`/Comments/${postData.id}`} className='post__comment' onClick={() => setCommentsData(postData)}>
                    <CommentIcon/>
                </Link>
            </div>

            <div className='post__vote col'>
                <div className={
                    postData.upVotes.length !== 0 && userPrevVotes.isUpvote && userPrevVotes.isUpvote !== 'no-vote' ? 
                    'post__upVote--selected post__upVote row' : 
                    'post__upVote row'
                }>
                    <h3>{postData.upVotes.length}</h3>
                    <button className='ctr' onClick={() => voteOnClick(true)}>
                        <UpVoteIcon/>
                    </button>
                </div>
                <div className={
                    postData.downVotes.length !== 0 && !userPrevVotes.isUpvote && userPrevVotes.isUpvote !== 'no-vote' ? 
                    'post__downVote--selected post__downVote row': 
                    'post__downVote row'
                }>
                    <h3>{postData.downVotes.length}</h3>
                    <button className='ctr' onClick={() => voteOnClick(false)}>
                        <DownVoteIcon/>
                    </button>
                </div>
            </div>

            <button 
                className=
                {
                    //only the user who created the post or the owner of the subreddit can delete the specific post
                    onSubReddit && (currentUser[0]?.uid === postData.createdByUid || currentUser[0]?.uid === postData.subRedditOwnedByUid) ? 
                    'post__delete button-clear ctr' : 
                    'none'
                } 
                onClick={postDeleteOnClick}>
                <DeleteIcon/>
            </button>
        </div>
    )
}

export default Post;