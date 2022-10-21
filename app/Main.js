import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:8080";
//my components
import Footer from "./components/Footer";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import About from "./components/About";
import Terms from "./components/Terms";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessage from "./components/FlashMessage";

function Main() {
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("complexappToken")));
  const [flashMessage, setFlashMessage] = useState([]); //array of messages
  //function so we can pass this add flash message into our CreatePost Component
  function addFlashMessage(msg) {
    setFlashMessage(prev => prev.concat(msg)); //concat the message to previous message
  }
  return (
    <BrowserRouter>
      <FlashMessage messages={flashMessage} />
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path="/" element={loggedIn ? <Home /> : <HomeGuest />} />
        <Route path="/post/:id" element={<ViewSinglePost />} />
        <Route path="create-post" element={<CreatePost addFlashMessage={addFlashMessage} />} />
        <Route path="about-us" element={<About />} />
        <Route path="terms" element={<Terms />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
