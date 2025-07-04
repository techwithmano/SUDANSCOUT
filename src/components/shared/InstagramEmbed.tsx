
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
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const processInstgrm = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = processInstgrm;
      document.body.appendChild(script);
    } else {
        processInstgrm();
    }
    
  }, [url]);

  // The key forces a re-render of the blockquote, which is necessary for the script to re-process it.
  return (
    <div key={url} className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
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
