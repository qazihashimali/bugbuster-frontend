import React from "react";

const Footer = () => {
  return (
    <footer className=" text-white p-4 flex justify-end items-center bg-primary">
      {/* <select className=" rounded p-1 text-sm bg-primary" >
        <option>English</option>
      </select> */}
      <div className="flex space-x-4">
        <span>BUG BUSTER © 2025</span>
        <a href="#" className="text-white">
          Privacy Policy
        </a>
        <a href="#" className="text-white">
          Terms of Service
        </a>
        <a href="#" className="text-white">
          FAQ's
        </a>
      </div>
    </footer>
  );
};

export default Footer;
