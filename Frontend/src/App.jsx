import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./component/Home/home";
import ProjectList from "./component/project/project";
import Redirect from "./component/Add/Redirect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/first" element={<ProjectList />} />
        <Route path="/redirect/:id" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
