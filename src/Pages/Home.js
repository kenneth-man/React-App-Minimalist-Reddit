import React, { useContext, useEffect, useState, useRef} from 'react';
import { Context } from '../Context';
import SearchBar from '../Components/SearchBar';
import ResultList from '../Components/ResultList';
import ActionBar from '../Components/ActionBar';
import Post from '../Components/Post';
import NoData from '../Components/NoData';

const Home = () => {
    const { homeData, setHomeData, searchQuery, setSearchQuery, isSearching, readAllDocuments, readDocumentWoId, convertTimestampToDate } = useContext(Context);
    const [homePosts, setHomePosts] = useState([]);
    const [currentUser, setCurrentUser] = useState([]);
    const isInitialRender = useRef(true);

    useEffect(async () => {
        const currUser = await readDocumentWoId('users');
        setCurrentUser(currUser);

        return () => setCurrentUser([]);
    }, [])

    useEffect(async () => {
        if(isInitialRender.current){
            isInitialRender.current = false;
        } else if(currentUser.length > 0) {
            const allSubObjs = await readAllDocuments('subReddits');
            const allPostObjs = await readAllDocuments('posts', 'createdAt');

            const allSubscribedSubIds = currentUser[0].subscribedIds;
            const allSubscribedSubObjs = allSubObjs.filter(curr => allSubscribedSubIds.find(id => id === curr.id));
            const allSubscribedSubPostIds = allSubscribedSubObjs.map(curr => curr.postsIds);
            // concat array of arrays - https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
            const concatAllSubscribedSubPostIds = [].concat.apply([], allSubscribedSubPostIds);
            const allSubscribedSubPostObjs = allPostObjs.filter(curr => concatAllSubscribedSubPostIds.find(id => id === curr.id));
            
            //get most recent 30 posts in order of most new to less new
            setHomePosts(allSubscribedSubPostObjs.slice(-30).reverse());
        }
    }, [currentUser])

    return (
        <div className='Page home col fw'>
            <SearchBar
                state={searchQuery} 
                setState={setSearchQuery} 
                placeHolder='Type in the user or subreddit name...'
                targetState={setHomeData}
                isHomePage={true}
            />
            
            {
                isSearching ?
                <ResultList
                    state={homeData}
                /> :
                <div className='Page__section--medium home fw'>
                    <ActionBar
                        subRedditId={false}
                        isOwner={false}
                    />

                    <div className='home__posts col fw'>
                        {
                            homePosts.length > 0 ?
                            homePosts.map((curr, index) => 
                                <Post
                                    key={index}
                                    postData={curr}
                                    collection='posts'
                                    onSubReddit={false}
                                />
                            ) :
                            <NoData text='No Posts found...'/>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default Home;