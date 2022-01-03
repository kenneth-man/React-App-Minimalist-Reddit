import React, { useContext, useEffect } from 'react';
import { Context } from '../Context';
import { Link, NavLink } from 'react-router-dom';
import { ReactComponent as LogoIcon } from '../Res/Images/reddit-logo.svg';
import { ReactComponent as GlobalChatIcon } from '../Res/Icons/globe.svg';
import { ReactComponent as PrivateChatIcon } from '../Res/Icons/chat.svg';
import { ReactComponent as ProfileIcon } from '../Res/Icons/user.svg';

const NavBar = () => {
    const { db, scrollToTop, navbarDisplayName, setNavbarDisplayName, readDocumentWoId, setProfileData } = useContext(Context);

    //when profile button is clicked, set the 'profileData' state to currently signed in user's data from 'users' collection; to be used on 'Profile' screen
    const profileButtonOnClick = async () => {
        const currentUser = await readDocumentWoId('users');
        setProfileData(currentUser[0]);
        scrollToTop();
    }

    //when user refreshes page, need to get the user's displayName from 'users' collection to show on navbar again
    useEffect(async () => {
        if(db){
            const currentUser = await readDocumentWoId('users');

            //on initial render 'auth' may not be initialised yet (async operation)
            if(currentUser.length === 0) return;
            
            setNavbarDisplayName(currentUser[0].displayName);
        }
    }, [db])

    return (
        <div className='Page__section--smallest navbar row fw'>
            <Link to='/' exact='true' className='link'>
                <LogoIcon className='navbar__logo'/>
            </Link>

            <h2 className='italic'>Welcome back, {navbarDisplayName ? navbarDisplayName : '(NULL)'}</h2>

            <div className='navbar__wrapper row'>
                <NavLink to='/GlobalChat' exact='true' className={({ isActive }) => isActive ? 'navlink navlink--active row' : 'navlink row'} onClick={scrollToTop}>
                    <GlobalChatIcon className='mr'/>

                    Global Chat
                </NavLink>

                <NavLink to='/PrivateChat' exact='true' className={({ isActive }) => isActive ? 'navlink navlink--active row' : 'navlink row'} onClick={scrollToTop}>
                    <PrivateChatIcon className='mr'/>

                    Private Chat
                </NavLink>

                <NavLink 
                    to='/Profile' 
                    exact='true' 
                    className={({ isActive }) => isActive ? 'navlink navlink--active row' : 'navlink row'} 
                    onClick={profileButtonOnClick}
                >
                    <ProfileIcon className='mr'/>

                    {navbarDisplayName ? navbarDisplayName : '(NULL)'}
                </NavLink>
            </div>
        </div>
    )
}

export default NavBar;