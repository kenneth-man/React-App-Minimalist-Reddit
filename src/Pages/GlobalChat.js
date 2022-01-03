import React from 'react';
import Channel from '../Components/Channel';

const globalChat = () => {
    return (
        <div className='Page col fw'>
            <Channel
                component='Message' 
                collection='globalChat'
                sortBy='createdAt'
            />
        </div>
    )
}

export default globalChat;