import React from 'react';

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-3 text-xs text-gray-400">
          {/* Disclaimer */}
          <p>
            The 2XKO name is a registered trademark or trademark of Riot Games, Inc. 
            2XKOMBO is not affiliated with, endorsed, sponsored, or specifically approved by Riot Games, Inc.
          </p>
          
          {/* Attribution */}
          <p>
            Made by{' '}
            <span className="text-blue-400 font-medium">picklejason</span>.{' '}
            If you have any feedback please reach out on Discord{' '}
            <span className="text-blue-400 font-medium">@picklejason</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
