// // src/components/forum/ForumFilters.jsx
// import React, { useState } from 'react';
// import { 
//   Box, Tabs, Tab, Menu, MenuItem, IconButton, useMediaQuery 
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import WhatshotIcon from '@mui/icons-material/Whatshot';
// import ScheduleIcon from '@mui/icons-material/Schedule';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// const ForumFilters = ({ currentFilter, onFilterChange }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [tabValue, setTabValue] = useState(currentFilter === 'newest' ? 0 : (currentFilter === 'popular' ? 1 : 2));
  
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//     const filterValue = newValue === 0 ? 'newest' : (newValue === 1 ? 'popular' : 'oldest');
//     onFilterChange(filterValue);
//   };

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = (filter) => {
//     setAnchorEl(null);
//     if (filter) {
//       onFilterChange(filter);
//       setTabValue(filter === 'newest' ? 0 : (filter === 'popular' ? 1 : 2));
//     }
//   };
  
//   return (
//     <Box sx={{ mb: 3 }}>
//       {isMobile ? (
//         <Box sx={{ textAlign: 'right' }}>
//           <IconButton onClick={handleClick}>
//             <FilterListIcon />
//           </IconButton>
//           <Menu
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={() => handleClose()}
//           >
//             <MenuItem 
//               onClick={() => handleClose('newest')}
//               selected={currentFilter === 'newest'}
//             >
//               <ScheduleIcon sx={{ mr: 1 }} /> Mới nhất
//             </MenuItem>
//             <MenuItem 
//               onClick={() => handleClose('popular')}
//               selected={currentFilter === 'popular'}
//             >
//               <WhatshotIcon sx={{ mr: 1 }} /> Phổ biến
//             </MenuItem>
//             <MenuItem 
//               onClick={() => handleClose('oldest')}
//               selected={currentFilter === 'oldest'}
//             >
//               <TrendingUpIcon sx={{ mr: 1 }} /> Cũ nhất
//             </MenuItem>
//           </Menu>
//         </Box>
//       ) : (
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           textColor="primary"
//           indicatorColor="primary"
//           aria-label="forum tabs"
//         >
//           <Tab 
//             icon={<ScheduleIcon />} 
//             iconPosition="start" 
//             label="Mới nhất" 
//           />
//           <Tab 
//             icon={<WhatshotIcon />} 
//             iconPosition="start" 
//             label="Phổ biến" 
//           />
//           <Tab 
//             icon={<TrendingUpIcon />} 
//             iconPosition="start" 
//             label="Cũ nhất" 
//           />
//         </Tabs>
//       )}
//     </Box>
//   );
// };

// export default ForumFilters;
