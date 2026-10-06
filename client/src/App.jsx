import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;