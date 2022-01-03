import React, { useContext } from 'react';
import { Context } from '../Context';
import { ReactComponent as MagnifyingGlassIcon } from '../Res/Icons/magnifying-glass.svg';
import Input from './Input';

const SearchBar = ({ state, setState, placeHolder, targetState, isHomePage }) => {
    const { setIsSearching, readAllDocuments, setIsLoading } = useContext(Context);

    const searchbarButtonOnClick = async () => {
        let users;
        let subreddits;
        let all;

        setIsLoading(true);
        setIsSearching(true);

        users = await readAllDocuments('users');
        subreddits = await readAllDocuments('subReddits');
        all = users.concat(subreddits);

        isHomePage ?
        targetState(all.filter(curr => curr.displayName.toLowerCase().includes(state.toLowerCase()))) :
        targetState(users.filter(curr => curr.displayName.toLowerCase().includes(state.toLowerCase())))

        setIsLoading(false);
    }

    return (
        <div className='Page__section--small searchbar col fw'>
            <h1>{isHomePage ? 'Search for users and subreddits' : 'Search for users'}</h1>

            <div className='searchbar__cont row'>
                <Input  
                    inputType='text'
                    inputPlaceholder={placeHolder}
                    state={state}
                    setState={setState}
                />

                <button className='searchbar__btn' disabled={!state} onClick={searchbarButtonOnClick}>
                    <MagnifyingGlassIcon/>
                </button>
            </div>
        </div>
    )
}

export default SearchBar;