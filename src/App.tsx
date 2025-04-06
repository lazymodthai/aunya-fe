import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout, { Content, Header } from "antd/es/layout/layout";
import Navbar from "./components/main/Navbar";
import Main from "./pages/Main";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <Layout style={{ width: "100vw", height: "100vh" }}>
      <Header style={{ padding: 0, background: 'none', position: 'relative'}}>
        <Navbar />
      </Header>
      <Content style={{ padding: "48px" }}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
