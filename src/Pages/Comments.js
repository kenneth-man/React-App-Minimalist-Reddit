import React, { useContext } from 'react';
import { Context } from '../Context';
import Channel from '../Components/Channel';

const Comments = () => {
    const { commentsData } = useContext(Context);

    return (
        <div className='Page col fw'>
            <Channel 
                component='Comment'
                collection='comments' 
                sortBy='createdAt'
                matchToId={commentsData.id}
            />
        </div>
    )
}

export default Comments;