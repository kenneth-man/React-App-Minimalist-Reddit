import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../Context';
import { Link } from 'react-router-dom';
import { ReactComponent as LogInIcon } from '../Res/Icons/sign-in.svg';
import { ReactComponent as GoogleIcon } from '../Res/Icons/google3.svg';
import Input from '../Components/Input';
import Banner from '../Components/Banner';
import Loading from '../Components/Loading';
import { BannerImageData } from '../DataFiles/BannerImageData';
import logo from '../Res/Images/reddit-logo.svg';
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
    const { auth, LoginWithGoogle, scrollToTop, isLoading, setIsLoading } = useContext(Context);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState(null);

    //login account with email and password
    const loginAccountOnSubmit = async (eventObj) => {
        eventObj.preventDefault();
        
        try {
            setIsLoading(true);
            //triggers 'onAuthStateChanged' to run in context and App.js
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            setIsLoading(false);
        } catch(error){
            setLoginError({ code: error.code, message: error.message });
        }
    }

    useEffect(() => {
        if(loginError){
            alert(`Error Message: ${loginError.message}, CODE ${loginError.code}`);
            setLoginEmail('');
            setLoginPassword('');
            setIsLoading(false);
        }
    }, [loginError])

    return (
        <div className='Page login col fw'>
            <div className='Page__section--medium login__header col fw'>
                <img src={logo} alt='reddit-logo' className='login__logo'/>

                <h1 className='italic'>'Minimalist Reddit' by Kenneth Man (with Firebase v9)</h1>
            </div>   

            <Banner image={BannerImageData[4]}/>

            {
                isLoading && 
                <Loading/> 
            }

            <div className='Page__section--large col fw'>
                <form className='Page__section--medium col fw' onSubmit={e => loginAccountOnSubmit(e)}>
                    <h1 className='underline bold italic'>Log in with Email</h1>

                    <Input inputType='text' inputPlaceholder='Type in your email address here...' state={loginEmail} setState={setLoginEmail}/>

                    <Input inputType='password' inputPlaceholder='Type in your password here...' state={loginPassword} setState={setLoginPassword}/>

                    <button type='submit' className='row'>
                        <LogInIcon className='mr'/>

                        Log In
                    </button>
                </form>

                <div className='Page__section--small ctr fw'>
                    <h1 className='bold italic'>&ndash; &nbsp; OR &nbsp; &ndash;</h1>
                </div>

                <div className='Page__section--small col fw'>
                    <h1 className='underline bold italic'>Log in with Google</h1>

                    <button onClick={LoginWithGoogle} className='row'>
                        <GoogleIcon className='mr'/>

                        Google Account
                    </button>
                </div>
            </div>

            <div className='Page__section--small ctr fw'>
                <Link to='/Register' exact='true' className='link' onClick={scrollToTop}>Not already registered? Click here to register an account 🡆</Link>
            </div>

            <Banner image={BannerImageData[0]}/>
        </div>
    )
}

export default Login;