import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import AlertToast from "./components/AlertToast";

const App = () => {
  return (
    <div className="w-full p-6">
      <AlertToast />
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App