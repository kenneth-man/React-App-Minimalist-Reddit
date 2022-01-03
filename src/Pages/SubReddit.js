import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../Context';
import Channel from '../Components/Channel';
import SearchBar from '../Components/SearchBar';
import ActionBar from '../Components/ActionBar';
import ResultList from '../Components/ResultList';
import NoData from '../Components/NoData';
import Loading from '../Components/Loading';
import logoImage from '../Res/Images/reddit-logo.svg';

const SubReddit = () => {
    const { auth, subRedditData, searchQuery, setSearchQuery, isSearching, checkIsOwner, isLoading } = useContext(Context);
    const [subRedditSearchData, setSubRedditSearchData] = useState([]);
    const [isCurrUserOwner, setIsCurrUserOwner] = useState(false);
    
    //if subRedditData is truthy, check if currently signed in user is owner and setState
    useEffect(async () => subRedditData && checkIsOwner(auth, subRedditData, setIsCurrUserOwner), [subRedditData])

    return (
        <div className='Page subReddit col fw'>
            {
                subRedditData ?
                <>
                    {
                        isCurrUserOwner &&
                        <SearchBar
                            state={searchQuery}
                            setState={setSearchQuery}
                            placeHolder="Type in the user's name..."
                            targetState={setSubRedditSearchData}
                            isHomePage={false}
                        /> 
                    }
                    
                    <ActionBar
                        subRedditId={subRedditData.id}
                        isOwner={isCurrUserOwner}
                    />

                    <div className='Page__section--sMedium subReddit__header col fw'>
                        <div className='subReddit__wrapper col'>
                            <img src={subRedditData.photoURL ? subRedditData.photoURL : logoImage} alt='subreddit-image' className='subReddit__img'/>
                            <h2 className='bold underline'>{subRedditData.displayName}</h2>
                            <h3 className='italic'>{subRedditData.desc}</h3>
                        </div>
                        <h3>{subRedditData.subscribedByUids ? subRedditData.subscribedByUids.length : '???'} Subscribers</h3>
                        <h4><span className='bold'>{subRedditData.ownedByName}</span> is the owner of this Subreddit</h4>
                    </div>

                    {
                        isSearching ?
                        <ResultList
                            state={subRedditSearchData}
                        /> :
                        <Channel 
                            component='Post'
                            collection='posts' 
                            sortBy='createdAt'
                            reverseOrder={true}
                            matchToId={subRedditData.id}
                        />
                    }
                </> :
                (
                    isLoading ? 
                    <Loading/> :
                    <NoData text='No Subreddit Selected. Use the Homepage Searchbar to select a subreddit'/>
                )
            }
        </div>
    )
}

export default SubReddit;