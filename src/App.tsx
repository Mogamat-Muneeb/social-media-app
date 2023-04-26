import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Main } from "./pages/main/main";
import { Login } from "./pages/login";
import { Account } from "./pages/account";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { CreatePost } from "./pages/create-post/create-post";
import { SinglePost } from "./pages/singlepost";
function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path=":uid" element={<Account />} />
          <Route  path="/posts/:postId" element={<SinglePost/>} />
        </Routes>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;
