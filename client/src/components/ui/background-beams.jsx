import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export const BackgroundBeams = ({ className }) => {
  const beamsRef = useRef(null);

  useEffect(() => {
    if (!beamsRef.current) return;

    const updateMousePosition = (ev) => {
      if (!beamsRef.current) return;
      const { clientX, clientY } = ev;
      beamsRef.current.style.setProperty('--x', `${clientX}px`);
      beamsRef.current.style.setProperty('--y', `${clientY}px`);
    };

    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <div className={cn('h-full w-full relative', className)}>
      <div
        ref={beamsRef}
        className="h-full w-full absolute inset-0 overflow-hidden [--x:0px] [--y:0px] z-0"
      >
        <div className="absolute w-[500px] h-[500px] -top-[100px] -left-[100px] bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 blur-[100px]"></div>
        <div className="absolute w-[600px] h-[600px] -bottom-[100px] -right-[100px] bg-gradient-to-r from-cyan-500 to-green-500 opacity-10 blur-[100px]"></div>
        <div className="absolute w-[300px] h-[300px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-10 blur-[100px]"></div>
      </div>
      <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(ellipse_at_var(--x,50%)_var(--y,50%),transparent_0%,black_70%)] z-10"></div>
    </div>
  );
};