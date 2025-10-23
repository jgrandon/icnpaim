import React, {useRef} from 'react'

export function useResponsive () {
    const windowWidth = useRef(window.innerWidth);
    
    useEffect(() => {
    const handleResize = () => {
        windowWidth.current = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);

    return windowWidth
}
