import React, { useContext } from 'react';
import { Context } from '../Context';
import Input from '../Components/Input';
import { ReactComponent as CloseIcon } from '../Res/Icons/close.svg';

const Modal = ({ closeFunc, submitFunc, inputFieldsData, imageSetState }) => {
    //###UPLOAD IMG CODE###
    // const { onImageChange } = useContext(Context);

    return (
        <div className='Page edit-modal ctr fw fh'>
            <button onClick={closeFunc} className='edit-close'>
                <CloseIcon/>
            </button>

            <form className='col fw fh' onSubmit={e => submitFunc(e)}>
                {/* //###UPLOAD IMG CODE### */}
                {/* <div className='Page__section-small col fw'>
                    <h1>Upload a new Image</h1>
                    <input type="file" onChange={e => onImageChange(e, imageSetState)} className='edit-modal__upload'/>
                </div> */}

                {
                    inputFieldsData.map((curr, index) => 
                        <div key={index} className='Page__section-small col fw'>
                            <h1>{curr.inputName}</h1>
                            <Input inputType={curr.inputType} inputPlaceholder={curr.inputPlaceholder} state={curr.inputState} setState={curr.inputSetState}/>
                        </div>
                    )
                }

                <button type='submit'>Save Changes</button>
            </form>
        </div>
    )
}

export default Modal;