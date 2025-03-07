"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://github.com/yasuo72');
        const data = await response.json();
        setStarCount(data.stargazers_count); // Get the star count
      } catch (error) {
        console.error('Error fetching star count:', error);
      }
    };

    fetchStarCount();
  }, []);

  return (
    <footer className="mt-188px w-full">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex justify-between items-start">
          {/* Left side */}
          <div>
            <div className="text-gray-500 text-xs mb-4 pt-1 pb-1 pl-3 pr-3 bg-slate-100 max-w-[190px]">
              Free Open source AI template
            </div>
            <div className="text-black mb-4 text-2xl font-bold font-sans">
              Build your own Health Scribe GPT
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/yasuo72.git"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-xs"
              >
                Fork and Build Your Own
              </Link>
              <div className="relative inline-flex items-center group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 hover:bg-black hover:text-white transition-colors text-xs">
                  <svg viewBox="0 0 16 16" width="16" height="16" className="fill-current">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  Star
                </button>

                  <div className="relative w-20 h-8">
                    <svg viewBox="0 0 80 32" className="w-full h-full">
                      {/* Background shape with larger notch pointing left */}
                      <path
                        d="M 12 2
                          H 72
                          Q 78 2 78 8
                          V 24
                          Q 78 30 72 30
                          H 12
                          Q 6 30 6 24
                          V 20
                          L 0 16
                          L 6 12
                          V 8
                          Q 6 2 12 2"
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        className="drop-shadow-sm"
                      />
                      {/* Number text */}
                      <text x="42" y="16" textAnchor="middle" dominantBaseline="middle" className="text-sm" fill="black">
                        {starCount}
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>


          {/* Right side */}
          <div className="flex flex-col items-end gap-4">
            {/* Made with love section */}
            <div className="flex items-center gap-2 pt-8">
              <span className="text-gray-600 font-sans">MADE WITH</span>
              <span className="text-black text-xl font-sans">♥</span>
              <span className="text-gray-600 font-sans">BY</span>
              <div className="flex items-center">
                <Image
                  alt="crystal ball"
                  src="https://metaschool.so/_next/static/media/crystalball.074cad21.webp"
                  width={20}
                  height={20}
                />
                <span className="text-xl font-semibold ml-2 leading-none font-sans">
                  Rohit
                </span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center">
              <span className="mr-4 text-gray-600 pt-4 font-sans">Follow us on</span>
              <div className="flex items-center gap-3 pt-4">
                <Link href=" ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </Link>
                <Link href="https://x.com/Rohitsi12148892">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link href="https://www.linkedin.com/in/rohit-singh-47b9a0302/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;