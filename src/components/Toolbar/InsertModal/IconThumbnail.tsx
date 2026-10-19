import React, { useState, useEffect } from 'react';

interface IconThumbnailProps {
  url: string;
  name: string;
  theme: 'light' | 'dark';
}

export const IconThumbnail: React.FC<IconThumbnailProps> = ({ url, name, theme }) => {
  const [imgSrc, setImgSrc] = useState(url);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    setImgSrc(url);
    setRetries(0);
  }, [url]);

  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '7px',
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <img
        src={imgSrc}
        alt={name}
        style={{
          width: '28px',
          height: '28px',
          objectFit: 'contain'
        }}
        loading="lazy"
        onError={() => {
          if (retries < 3) {
            setTimeout(() => {
              const separator = url.includes('?') ? '&' : '?';
              setImgSrc(`${url}${separator}r=${retries + 1}`);
              setRetries(prev => prev + 1);
            }, 350 * (retries + 1));
          }
        }}
      />
    </div>
  );
};
