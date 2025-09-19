import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-3 text-xs md:text-sm text-gray-400 text-center md:text-left">
          {/* Disclaimer */}
          <p className="leading-relaxed">
            The 2XKO name is a registered trademark or trademark of Riot Games, Inc.
            2XKOMBO is not affiliated with, endorsed, sponsored, or specifically approved by Riot Games, Inc.
          </p>


			{/* Attribution + Legal */}
			<div className="leading-relaxed flex items-center justify-between gap-4">
				<p className="">
					Made by{' '}
					<span className="text-blue-400 font-medium">picklejason</span>.{' '}
					If you have any feedback please reach out on Discord{' '}
					<span className="text-blue-400 font-medium">@picklejason</span>.
				</p>
				<Link href="/privacy" className="text-blue-400 font-medium" aria-label="Read our Privacy Policy">Privacy Policy</Link>
			</div>
        </div>
      </div>
    </footer>
  );
}
