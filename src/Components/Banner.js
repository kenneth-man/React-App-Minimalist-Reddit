import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

//lazy loading banner image
const Banner = ({ image }) => {
    return (
        <LazyLoadImage effect='opacity' threshold={-100} src={image} alt='banner' className='banner fw' wrapperClassName='bannerWrapper fw'/>
    )
}

export default Banner;