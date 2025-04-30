import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import HomeAdmin from "./components/Admin/AdminDashboard/HomeAdmin";
import ManagePostAdmin from "./components/Admin/AdminDashboard/ManagePostAdmin";
import AdminHeader from "./components/Admin/AdminHeader/AdminHeader";
import ManageUsers from "./components/Admin/ManageUsers/ManageUsers";
import UserPosts from "./components/Admin/ManageUsers/UserPosts";
import EditNewsForm from "./components/Admin/News/EditNewsForm/EditNewsForm";
import NewsDetail from "./components/Admin/News/NewsDetail/NewsDetail";
import NewsForm from "./components/Admin/News/NewsForm/NewsForm";
import NewsList from "./components/Admin/News/NewsList/NewsList";
import NewsManagement from "./components/Admin/News/NewsManagement/NewsManagement";
import Footer from "./components/Footer/Footer";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword ";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ResetPassword from "./components/ResetPassword/ResetPassword ";
import AboutUs from "./components/User/AboutUs/AboutUs";
import ChangePassword from "./components/User/ChangePassword/ChangePassword";
import Chat from "./components/User/Chat/chat";
import ComplaintForm from "./components/User/ComplaintForm";
import Header from "./components/User/Header/Header";
import Home from "./components/User/Home/Home";
import ManageAcount from "./components/User/ManageAcount/ManageAcount";
import UpdatePost from "./components/User/ManageAcount/UpdatePost";
import NewsDetailUser from "./components/User/News/NewsDetail/NewsDetailUser";
import NewsListUser from "./components/User/News/NewsList/NewsListUser";
import PaymentPage from "./components/User/Payment/PaymentPage";
import PolicyTerms from "./components/User/PolicyTerms/PolicyTerms";
import AddPost from "./components/User/Post/AddPost/AddPost";
import PostDetail from "./components/User/Post/PostDetail";
import PostsPage from "./components/User/Post/PostPage";
import SearchPosts from "./components/User/Search/searchPosts";
import SearchResultsPage from "./components/User/Search/searchResultPage";
import CompareChart from "./components/User/CompareArea/CompareChart";

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="content-wrapper">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <SearchPosts />
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route
              path="/search"
              element={
                <>
                  <Header />
                  <SearchPosts />
                  <SearchResultsPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/posts"
              element={
                <>
                  <PostsPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/CanHoPost"
              element={
                <>
                  <PostsPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/VanPhongPost"
              element={
                <>
                  <PostsPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/news"
              element={
                <>
                  <Header />
                  <SearchPosts />
                  <NewsListUser />
                  <Footer />
                </>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <>
                  <HomeAdmin /> <Footer />
                </>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/about-us"
              element={
                <>
                  <Header />
                  <AboutUs />
                  <Footer />
                </>
              }
            />
            <Route
              path="/policy-terms"
              element={
                <>
                  <Header />
                  <PolicyTerms />
                  <Footer />
                </>
              }
            />
            <Route
              path="/chang-pass"
              element={
                <>
                  <AdminHeader />
                  <ChangePassword />
                  <Footer />
                </>
              }
            />
            <Route
              path="/AddPost"
              element={
                <>
                  <Header />
                  <AddPost />
                  <Footer />
                </>
              }
            />
            <Route
              path="/posts/:id"
              element={
                <>
                  <PostDetail /> <Footer />
                </>
              }
            />
            <Route
              path="/managerAc"
              element={
                <>
                  <ManageAcount /> <Footer />
                </>
              }
            />
            <Route
              path="/update-post/:id"
              element={
                <>
                  <UpdatePost /> <Footer />
                </>
              }
            />
            <Route
              path="/manage-news/edit/:id"
              element={
                <>
                  <AdminHeader />
                  <EditNewsForm />
                  <Footer />
                </>
              }
            />
            <Route
              path="/TinTuc"
              element={
                <>
                  <Header />
                  <NewsListUser />
                  <Footer />
                </>
              }
            />
            <Route
              path="/news/:id"
              element={
                <>
                  <Header />
                  <NewsDetailUser />
                  <Footer />
                </>
              }
            />
            <Route
              path="/manage-news/:id"
              element={
                <>
                  <AdminHeader />
                  <NewsDetail />
                  <Footer />
                </>
              }
            />
            <Route
              path="/manage-users"
              element={
                <>
                  <AdminHeader />
                  <ManageUsers />
                  <Footer />
                </>
              }
            />
            <Route
              path="/manage-news/*"
              element={
                <>
                  <AdminHeader />
                  <NewsManagement />
                  <Footer />
                </>
              }
            >
              {/* Các Route con của /manage-news */}
              <Route
                path="list"
                element={
                  <>
                    <NewsList /> <Footer />
                  </>
                }
              />
              <Route
                path="add"
                element={
                  <>
                    <NewsForm /> <Footer />
                  </>
                }
              />
              <Route
                path=":id"
                element={
                  <>
                    <NewsDetail /> <Footer />
                  </>
                }
              />
            </Route>
            <Route
              path="/manage-posts"
              element={
                <>
                  <AdminHeader />
                  <ManagePostAdmin />
                  <Footer />
                </>
              }
            />
            <Route
              path="/user-posts/:userId"
              element={
                <>
                  <AdminHeader />
                  <UserPosts />
                  <Footer />
                </>
              }
            />
            <Route
              path="/chat"
              element={
                <>
                  <Header />
                  <Chat />
                </>
              }
            />
            <Route
              path="/payment/:plan"
              element={
                <>
                  <Header />
                  <PaymentPage />
                  <Footer />
                </>}
            />
            <Route
              path="/complaints"
              element={
                <>
                  <Header />
                  <ComplaintForm />
                  <Footer />
                </>
              }
            />
            <Route
              path="/compare-chart"
              element={
                <>
                  <Header />
                  <CompareChart />
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;