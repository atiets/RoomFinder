import { useDispatch, useSelector } from "react-redux";
import { setSelectedMenu } from "../../../redux/menuSlice";
import ChangePassword from "../ChangePassword/ChangePassword";
import FavoritePosts from "../FavoritePosts/FavoritePosts";
import Header from "../Header/Header";
import ViewedPost from "../ViewedPost/ViewedPost";
import EditProfile from "./EditProfile";
import ListUserPost from "./listUserPost";
import "./ManageAcount.css";
import ManageThread from "./ManageThread";
import Sidebar from "./Sidebar";
import UpdatePost from "./UpdatePost";
import UserStatistics from "./UserStatistics";
import TransactionHistory from "../TransactionHistory/TransactionHistory";

const ManageAcount = () => {
  document.title = "Quản lý tài khoản";
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const selectedMenu = useSelector((state) => state.menu.selectedMenu);
  const setSelectedPost = useSelector((state) => state.posts.selectedPost);

  const renderContent = () => {
    switch (selectedMenu) {
      case "postList":
        return (
          <ListUserPost
            setSelectedMenu={setSelectedMenu}
            setSelectedPost={setSelectedPost}
          />
        );
      case "updatePost":
        return <UpdatePost postId={setSelectedPost} />;
      case "manageAccount":
        return <EditProfile user={currentUser || null} />;
      case "changePass":
        return <ChangePassword />;
      case "favoritePosts":
        return <FavoritePosts />;
      case "viewedPosts":
        return <ViewedPost />;
      case "statistics":
        return <UserStatistics />;
      case "forumPosts":
        return <ManageThread />;
      case "transactionHistory":
        return <TransactionHistory />;
      default:
        return <EditProfile user={currentUser || null} />;
    }
  };

  const handleChangeMenu = (menu) => {
    dispatch(setSelectedMenu(menu));
  };

  return (
    <div className="manageAcount-container">
      <Header />
      <div className="container-body">
        <Sidebar
          user={currentUser || null}
          setSelectedMenu={handleChangeMenu}
        />
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ManageAcount;
