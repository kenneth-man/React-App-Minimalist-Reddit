import React, { useState } from 'react';
import Result from './Result';

const ResultCol = ({ state }) => {
    const [isResultColShown, setIsResultColShown] = useState(false);

    return (
        <div className={isResultColShown ? `resultCol col` : ''}>
            <h3 className={`bold italic resultCol__msg ${isResultColShown ? 'mt-xl mb-xl' : ''}`} onClick={() => setIsResultColShown(!isResultColShown)}>
                {
                    isResultColShown ?
                    'Click here to close 🡅' :
                    'Click here to view Subscriptions 🡇' 
                }
            </h3>
            {
                isResultColShown &&
                state.map((curr, index) => 
                    <Result
                        key={index}
                        fullData={curr}
                    />
                ) 
            }
        </div>
    )
}

export default ResultCol;