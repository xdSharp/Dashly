import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
} 