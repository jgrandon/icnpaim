import React, {useRef, useEffect} from 'react'

export function useResponsive () {
    const windowWidth = useRef(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => {
            console.log('handle resize', window.innerWidth)
            windowWidth.current = window.innerWidth;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowWidth
}
