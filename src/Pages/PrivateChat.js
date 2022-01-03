import React, { useContext } from 'react';
import { Context } from '../Context';
import Channel from '../Components/Channel';

const PrivateChat = () => {
    const { auth, privateChatUsers } = useContext(Context);
    const privateChatCollection = 
        privateChatUsers.length > 0 && privateChatUsers.find(curr => curr.uid === auth.currentUser.uid) &&
        `${privateChatUsers[0].uid}-and-${privateChatUsers[1].uid}`;

    return (
        <div className='Page col fw'>
            <div className='Page__section--smallest ctr fw' style={{backgroundImage: 'linear-gradient(to right, rgba(117,117,117,0.1), rgba(0,0,0,0.3), rgba(117,117,117,0.1)'}}>
                {
                    privateChatCollection ?
                    <h1>Private Chat &ndash; {privateChatUsers[0].name} and {privateChatUsers[1].name}</h1> :
                    <h1>No Private Chat Selected</h1>
                }
            </div>

            {
                privateChatCollection &&
                <Channel
                    component='Message'
                    collection={privateChatCollection}
                    sortBy='createdAt'
                /> 
            }
        </div>
    )
}

export default PrivateChat;