import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Modal
} from '@mui/material';
import React from 'react';
import './index.css';

const ModalCategory = ({ open, onClose, onSelect, categories = [] }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            className='modal-category'
        >
            <div className='modal-category-container'>
                <Box display="flex" alignItems="center" mb={2}>
                    <h2 className='modal-category-title'>Chọn danh mục bất động sản</h2>
                </Box>
                <List>
                    {categories.map((cat) => (
                        <React.Fragment key={cat}>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => onSelect(cat)}>
                                    <ListItemText primary={cat} />
                                    <ArrowForwardIosIcon fontSize="14px" />
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </div>
        </Modal>
    );
};

export default ModalCategory;
