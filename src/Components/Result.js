import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../Context';
import Image from '../Components/Image';
// import logoImage from '../Res/Images/reddit-logo.svg';
import { Link } from 'react-router-dom';

const Result = ({ fullData }) => {
    const { setProfileData, setSubRedditData, formatSlug, checkIfBlobImage, setSearchQuery } = useContext(Context);
    //###UPLOAD IMG CODE###
    // const [displayImage, setDisplayImage] = useState('');

    // useEffect(() => {
    //     checkIfBlobImage(fullData, setDisplayImage);

    //     return () => setDisplayImage('');
    // },[])

    const resultOnClick = () => {
        fullData.email ? setProfileData(fullData) : setSubRedditData(fullData);
        setSearchQuery('');
    }

    return (
        <Link 
            to={fullData.email ? '/Profile' : `/SubReddit/${formatSlug(fullData.displayName)}`} 
            exact='true' 
            className='link result row link'
            onClick={resultOnClick}
        >      
            {/* //###UPLOAD IMG CODE### */}
            {/* <Image image={displayImage ? displayImage : logoImage} className='result__img'/> */}
            <Image image={fullData.photoURL} className='result__img'/>

            <div className='col'>
                <h1>{fullData.displayName}</h1>
                <h2>{fullData.email ? fullData.email : fullData.ownedByName}</h2>
                <h4 className='italic'>{fullData.desc ? fullData.desc.slice(0,15) : '(No description found...)'}</h4>
                <h3 className='bold'>{fullData.email ? '(USER)' : '(SUBREDDIT)'}</h3>
            </div>  
        </Link>
    )
}

export default Result;