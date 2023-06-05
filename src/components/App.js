import "../styles/App.css";
import CreateLink from "./CreateLink";
import LinkList from "./LinkList";
import Header from "./Header";
import Login from "./Login";
import Search from "./Search";
import { Navigate, Routes, Route } from "react-router-dom";

function App() {
  // return <LinkList />;
  // return <CreateLink />;
  return (
    <div className="center w85">
      <Header />
      <div className="ph3 pv1 background-gray">
        <Routes>
          <Route path="/" element={<Navigate replace to="/new/1" />}></Route>
          <Route path="/create" element={<CreateLink />}></Route>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/new/:page" element={<LinkList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
