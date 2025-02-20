import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const IntroLoader = () => {
  const gifs = [
    '/assets/Food-Application.gif', 
    // '/assets/loader-1.gif',
    '/assets/loader-2.gif',
  ];

  const [currentGifIndex, setCurrentGifIndex] = useState(() => Math.floor(Math.random() * gifs.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGifIndex(Math.floor(Math.random() * gifs.length));
    }, 2000); // Change GIF every 2 seconds

    return () => clearInterval(interval);
  }, [gifs.length]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '160px',
    }}>
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <Loader2 style={{
          width: '100%',
          height: '100%',
          color: 'red',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img 
            src={process.env.PUBLIC_URL + gifs[currentGifIndex]} 
            alt="Loader GIF"
            style={{
              width: '400px',
              height: '400px',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
      <div style={{
        marginBottom: '16px',
        color: 'red',
        fontWeight: 'bold',
        fontSize: '18px',
        animation: 'bounce 1s infinite',
        border: '1px solid white',
        padding: '10px',
        borderRadius: '10px',
        backgroundColor: 'white',
      }}>
        Cooking up some deliciousness...
      </div>
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '58px',
      }}>
        {['🍔', '🍕', '🌮', '🍣', '🍜'].map((emoji, index) => (
          <span
            key={index}
            style={{
              fontSize: '24px',
              animation: 'bounce 1s infinite',
              animationDelay: `${index * 0.15}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
      `}</style>
    </div>
  );
};

export default IntroLoader;