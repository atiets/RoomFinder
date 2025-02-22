import React from "react";
import { useSelector } from "react-redux";
import ListPostByStatusVisibility from "../Post/ListPostByStatusVisibility";

const ListPostVisible = () => {
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const status = "approved";
  const visibility = "visible";

  return (
    <div className="container-list-visible-in-manage">
      <ListPostByStatusVisibility
        status={status}
        visibility={visibility}
        token={token}
      />
    </div>
  );
};

export default ListPostVisible;
