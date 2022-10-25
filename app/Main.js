import React, { useState, useReducer } from "react";
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
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessage: []
  };

  function ourReducer(state, action) {
    switch (action.type) {
      case "login":
        //return the object that mimics our initial state
        return { loggedIn: true, flashMessage: state.flashMessage };
      case "logout":
        return { loggedIn: false, flashMessage: state.flashMessage };
      case "flashMessage":
        return { loggedIn: state.loggedIn, flashMessage: state.flashMessage.concat(action.value) };
    }
  }
  const [state, dispatch] = useReducer(ourReducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessage messages={state.flashMessage} />
          <Header />
          <Routes>
            <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="about-us" element={<About />} />
            <Route path="terms" element={<Terms />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
