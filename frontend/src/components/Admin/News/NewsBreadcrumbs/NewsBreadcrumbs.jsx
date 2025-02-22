import HomeIcon from "@mui/icons-material/Home";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import React from "react";
import { Link } from "react-router-dom";
import "./NewsBreadcrumbs.css";

const NewsBreadcrumbs = ({ current }) => {
  return (
    <div role="presentation">
      <Breadcrumbs aria-label="breadcrumb">
        <Chip
          component={Link}
          to="/admin-dashboard"
          label="Home"
          icon={<HomeIcon fontSize="small" />}
          className="styled-breadcrumb"
        />
        <Chip
          component={Link}
          // to="/quan-ly-tin-tuc"
          label="Quản lý tin tức"
          className="styled-breadcrumb"
        />
        <Chip label={current} className="styled-breadcrumb" />
      </Breadcrumbs>
    </div>
  );
};

export default NewsBreadcrumbs;
