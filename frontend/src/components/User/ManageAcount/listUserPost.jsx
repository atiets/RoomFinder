import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import React, { useState } from "react";
import ListPostHidden from "./ListPostHiden";
import ListPostPending from "./ListPostPending";
import ListPostVisible from "./ListPostVisible";
import "./listUserPost.css";

const ListUserPost = () => {
  document.title = "Danh sách tin đăng";
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} className="tab-listpost">
            <Tab label="Đang hiển thị" value="1" />
            <Tab label="Chờ duyệt" value="2" />
            <Tab label="Đã ẩn" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1" className="tab-panel">
          <ListPostVisible />
        </TabPanel>
        <TabPanel value="2" className="tab-panel">
          <ListPostPending />
        </TabPanel>
        <TabPanel value="3" className="tab-panel">
          <ListPostHidden />
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default ListUserPost;
