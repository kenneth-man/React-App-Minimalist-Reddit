import React, { useContext, useState} from 'react';
import { Context } from '../Context';
import Image from './Image';
import { ReactComponent as DeleteIcon } from '../Res/Icons/trash.svg';
import { MessageEmailUserIcons } from '../DataFiles/MessageEmailUserIcons';

const Message = ({ msgData, collection }) => {
    const { auth, deleteDocument, chooseRandomIndex, convertTimestampToDate } = useContext(Context);
    const [deleteBtnShown, setDeleteBtnShown] = useState(false);
    const msgSentByUser = msgData.uid === auth.currentUser.uid;
    const msgClass = msgSentByUser ? 'message__sent' : 'message__received';

    const toggleDeleteBtnShown = () => setDeleteBtnShown(!deleteBtnShown);

    return (
        <div className={`message ${msgClass} row fw`}>  
            {
                msgClass === 'message__sent' ?
                <div className='message__cont row fh' onMouseOver={toggleDeleteBtnShown} onMouseOut={toggleDeleteBtnShown}>
                    <p>{msgData.text}</p>

                    <div className='col'>
                        <Image image={msgData.photoURL ? msgData.photoURL : MessageEmailUserIcons[chooseRandomIndex(MessageEmailUserIcons.length)]} className='message__img'/>

                        <h2 className='mt'>{msgData.displayName}</h2>

                        <h3>{msgData.createdAt ? convertTimestampToDate(msgData.createdAt, true) : '(LOADING TIME...)'}</h3>
                    </div>
                    
                    <button onClick={() => deleteDocument(collection, msgData.id)} className={deleteBtnShown ? 'message__delete' : 'message__delete message__delete-hidden hidden'}>
                        <DeleteIcon/>
                    </button>    
                </div> :
                <div className='message__cont row fh'>
                    <div className='col'>
                        <Image image={msgData.photoURL ? msgData.photoURL : MessageEmailUserIcons[chooseRandomIndex(MessageEmailUserIcons.length)]} className='message__img'/>

                        <h2 className='mt'>{msgData.displayName}</h2>

                        <h3>{msgData.createdAt ? convertTimestampToDate(msgData.createdAt, true) : '(LOADING TIME...)'}</h3>
                    </div>

                    <p>{msgData.text}</p>
                </div>
            }  
        </div>
    )
}

export default Message;