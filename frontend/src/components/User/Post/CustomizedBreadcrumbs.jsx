import HomeIcon from "@mui/icons-material/Home";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import React from "react";
import { Link } from "react-router-dom";

const CustomizedBreadcrumbs = () => {
  return (
    <div role="presentation">
      <Breadcrumbs aria-label="breadcrumb">
        <Chip
          component={Link}
          to="/"
          label="Home"
          icon={<HomeIcon fontSize="small" />}
          className="styled-breadcrumb"
        />
        <Chip
          component={Link}
          to="/managerAc"
          label="Quản lý"
          className="styled-breadcrumb"
        />
        <Chip
          label="Đăng tin mới"
          className="styled-breadcrumb"
          onDelete={(event) => {
            event.preventDefault();
            console.info("Clicked on Đăng tin mới breadcrumb.");
          }}
        />
      </Breadcrumbs>
    </div>
  );
};

export default CustomizedBreadcrumbs;
