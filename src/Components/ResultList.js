import React, { useContext } from 'react';
import { Context } from '../Context';
import Result from './Result';
import NoData from './NoData';
import Loading from './Loading';

const ResultList = ({ state }) => {
    const { isLoading } = useContext(Context);

    return (
        <div className='resultList row fw'>
            {
                state.length > 0 ?
                state.map((curr, index) => 
                    <Result
                        key={index}
                        fullData={curr}
                    />
                ) :
                (
                    isLoading ?
                    <Loading/> :
                    <NoData text='No Results found...'/>
                )
            }
        </div>
    )
}

export default ResultList