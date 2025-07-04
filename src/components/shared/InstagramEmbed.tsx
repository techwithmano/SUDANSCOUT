
"use client";

import React, { useEffect } from 'react';

declare global {
    interface Window {
        instgrm?: {
            Embeds: {
                process: () => void;
            };
        };
    }
}

const InstagramEmbed = ({ url }: { url: string }) => {
  useEffect(() => {
    const scriptId = 'instagram-embed-script';

    const processInstgrm = () => {
      if (window.instgrm && typeof window.instgrm.Embeds?.process === 'function') {
        window.instgrm.Embeds.process();
      }
    };

    if (document.getElementById(scriptId)) {
      processInstgrm();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.defer = true;
    script.onload = processInstgrm;
    document.body.appendChild(script);

  }, [url]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
        <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ width: '100%', margin: 0, minWidth: 'auto' }}
        >
        </blockquote>
    </div>
  );
};

export default InstagramEmbed;
