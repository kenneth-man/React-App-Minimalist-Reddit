import React from 'react';
import loadingGif from '../Res/Images/loading.gif';

const Loading = () => {
    return (
        <div className='Page__section--small ctr fw'>
            <div className='row'>
                <img src={loadingGif} alt='loading-gif' style={{marginRight: '30px'}}/>

                <h1>Loading...</h1>
            </div>
        </div>  
    )
}

export default Loading;