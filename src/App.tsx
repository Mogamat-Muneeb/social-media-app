import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Main } from "./pages/main/main";
import { Login } from "./pages/login";
import { Account } from "./pages/account";
import { Navbar } from "./components/navbar.jsx";
import { Footer } from "./components/footer";
import { CreatePost } from "./pages/create-post/create-post";
import { SinglePost } from "./pages/singlepost";
import { MobileNav } from "./components/mobileNav";
import Explore from "./pages/explore";
import Notifications from "./pages/notifications";
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
          <Route path="/posts/:postId" element={<SinglePost />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
        <MobileNav />
        {/* <Footer/> */}
      </Router>
    </div>
  );
}

export default App;
