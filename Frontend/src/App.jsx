import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./component/Home/home";
import ProjectList from "./component/project/project";
import Redirect from "./component/Add/Redirect";
import Navbar from "./component/Navbar/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/list" element={<Home />} />
        <Route path="/" element={<ProjectList />} />
        <Route path="/redirect/:id" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
