import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className=" text-white p-4 flex justify-end items-center bg-primary">
      {/* <select className=" rounded p-1 text-sm bg-primary" >
        <option>English</option>
      </select> */}
      <div className="flex space-x-4">
        <span>BUG BUSTER © {new Date().getFullYear()}</span>
        <Link to="#" className="text-white">
          Privacy Policy
        </Link>
        <Link to="#" className="text-white">
          Terms of Service
        </Link>
        <Link to="#" className="text-white">
          FAQ's
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
