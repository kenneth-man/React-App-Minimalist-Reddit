import React from 'react';

const Input = ({ inputType, inputPlaceholder, state, setState }) => {
    return (
        <>
            { 
                inputType === 'textarea' ?
                <textarea placeholder={inputPlaceholder} value={state} onChange={e => setState(e.target.value)}/> :
                <input type={inputType} placeholder={inputPlaceholder} value={state} onChange={e => setState(e.target.value)}/>
            }
        </>
    )
}

export default Input;