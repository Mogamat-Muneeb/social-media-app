import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Main } from "./pages/main/main";
import { Login } from "./pages/login";
import { Account } from "./pages/account";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { CreatePost } from "./pages/create-post/create-post";
import { SinglePost } from "./pages/singlepost";
import { MobileNav } from "./components/mobileNav";
import Explore from "./pages/explore";
import Messages from "./components/Messages";
// import Notifications from "./pages/notifications";
function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/user/:uid" element={<Account />} />
          <Route path="/posts/:postId" element={<SinglePost />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:uuid" element={<Messages />} />
        </Routes>
        <MobileNav />
      </Router>
    </div>
  );
}

export default App;
