import React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import "./ReviewChecks.css";

const ReviewChecks = ({ reviewChecks, REVIEW_CHECKS }) => {
  if (!reviewChecks) return null;

  return (
    <div className="checkbox-group">
      {Object.entries(REVIEW_CHECKS).map(([key, label]) => (
        <FormControlLabel
          key={key}
          control={
            <Checkbox
              checked={!!reviewChecks[key]}
              disabled
              sx={{
                color: "#f44336",
                "&.Mui-checked": {
                  color: "#f44336",
                },
              }}
            />
          }
          label={
            <p style={{ fontSize: "0.87rem", textAlign: "left", margin: 0 }}>
              {label}
            </p>
          }
          sx={{ ml: 0 }}
        />
      ))}
    </div>
  );
};

export default ReviewChecks;