import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

//lazy loading image
const Image = ({ image, className }) => {
    return (
        <LazyLoadImage effect='opacity' threshold={0} src={image} alt='lazyload-image' className={className} wrapperClassName='lazyload-imageWrapper'/>
    )
}

export default Image;