import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./ReviewComments.css";

const ReviewComments = ({ comments, COMMENT }) => {
  if (!comments) return null;

  return (
    <Box mt={2} className="review-comments">
      {Object.entries(comments).map(([key, value]) => {
        if (!value) return null;

        //additional_comment không có tiêu đề
        if (key === "additional_comment") {
          return (
            <Box key={key} className="comment-item">
              <Typography
                variant="body2"
                className="comment-value"
                component="span"
              >
                {value}
              </Typography>
            </Box>
          );
        }

        // Các comment bình thường có tiêu đề
        return (
          <Box key={key} className="comment-item">
            <Typography
              variant="body2"
              className="comment-label"
              component="span"
            >
              {COMMENT[key]}:&nbsp;
            </Typography>
            <Typography
              variant="body2"
              className="comment-value"
              component="span"
            >
              {value}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ReviewComments;