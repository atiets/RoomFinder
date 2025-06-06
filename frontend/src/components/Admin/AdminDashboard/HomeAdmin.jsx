import { useDispatch, useSelector } from "react-redux";
import { setSelectedMenu } from "../../../redux/menuSlice";
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import AdminHeader from "../AdminHeader/AdminHeader";
import AdminReports from "../ManageReport";
import ManageThread from "../ManageThread";
import ManageUsers from "../ManageUsers/ManageUsers";
import UserPosts from "../ManageUsers/UserPosts";
import NewsForm from "../News/NewsForm/NewsForm";
import NewsList from "../News/NewsList/NewsList";
import NewsManagement from "../News/NewsManagement/NewsManagement";
import Sidebar from "../Sidebar/Sidebar";
import "./HomeAdmin.css";
import ManagePostAdmin from "./ManagePostAdmin";

const HomeAdmin = () => {
  document.title = "Trang chủ";
  const dispatch = useDispatch();
  const selectedMenu = useSelector((state) => state.menu.selectedMenu);

  const handleChangeMenu = (menu) => {
    dispatch(setSelectedMenu(menu));
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <AdminDashboard />;
      case "manageUser":
        return <ManageUsers />;
      case "managePost":
        return <ManagePostAdmin />;
      case "newsList":
        return <NewsList />;
      case "addNews":
        return <NewsForm />;
      case "managePost":
        return <ManagePostAdmin />;
      case "manageNews":
        return <NewsManagement />;
      case "userPost":
        return <UserPosts />;
      case "report":
        return <AdminReports />;
      case "thread":
        return <ManageThread />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: "64px" }}>
        <AdminHeader />
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: "250px" }}>
          <Sidebar setSelectedMenu={handleChangeMenu} />
        </div>
        <div style={{ flex: 1 }} className="home-admin-container-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
