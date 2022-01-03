import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../Context';
import { useNavigate } from 'react-router-dom';
import Input from '../Components/Input';
import Banner from '../Components/Banner';
import Loading from '../Components/Loading';
import { BannerImageData } from '../DataFiles/BannerImageData';
import { createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
    const { auth, scrollToTop, navbarDisplayName, isLoading, setIsLoading }  = useContext(Context);
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState(null);
    const validEmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g;
    const navigate = useNavigate();

    const checkValidEmail = () => registerEmail.match(validEmailRegex) ? true : false;

    const checkValidPassword = () => registerPassword.length >= 8 && registerPassword === registerConfirmPassword ? true : false;

    const registerAccountOnSubmit = async (eventObj) => {
        eventObj.preventDefault();

        if(checkValidEmail() && checkValidPassword()){
            try {
                setIsLoading(true);
                //creates account then signs user in if no error; triggers 'onAuthStateChanged' to run in context and App.js
                await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
                setIsLoading(false);
            } catch(error){
                setRegisterError({ code: error.code, message: error.message })
            }
        } else {
            alert('Invalid Email or Password format entered...'); 
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        if(navbarDisplayName !== '' && auth.currentUser) navigate('/');

        //cleanup function; Cancelling fetch requests if component is unmounting via navigate
        return () => controller.abort();
    }, [navbarDisplayName])

    useEffect(() => {
        if(registerError){
            alert(`Error Message: ${registerError.message}, Code: ${registerError.code}`);
            setRegisterError(null);
            setIsLoading(false);
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
        }
    }, [registerError])

    return (
        <div className='Page register col fw'>
            <Banner image={BannerImageData[2]}/>

            {
                isLoading && 
                <Loading/>
            }

            <form className='Page__section--large col fw' onSubmit={e => registerAccountOnSubmit(e)}>
                <h1>Register an account with Email and Password</h1>

                <Input inputType='text' inputPlaceholder='Enter a valid email address...' state={registerEmail} setState={setRegisterEmail}/>

                <Input inputType='password' inputPlaceholder='Enter a password (Minimum 8 characters)...' state={registerPassword} setState={setRegisterPassword}/>

                <Input inputType='password' inputPlaceholder='Retype your password...' state={registerConfirmPassword} setState={setRegisterConfirmPassword}/>

                {/* not using <Link> because i need a button type 'submit' element to submit the form element */}
                <button type='submit' onClick={scrollToTop}>Register</button>
            </form>
        </div>
    )
}

export default Register;