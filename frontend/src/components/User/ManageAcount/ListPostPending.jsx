import React from "react";
import { useSelector } from "react-redux";
import ListPost from "../Post/ListPostPendingInManage";

const ListPostPending = () => {
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const statusPending = "pending";
  const statusUpdate = "update";
  const visibility = "hidden";

  return (
    <div>
      <ListPost
        statusPending={statusPending}
        statusUpdate={statusUpdate}
        visibility={visibility}
        token={token}
      />
    </div>
  );
};

export default ListPostPending;
