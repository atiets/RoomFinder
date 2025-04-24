import React from 'react';
import AddPostLeft from '../AddPostLeft/index';
import AddPostRight from '../AddPostRight';
import './index.css';

const AddPost = () => {
    return (
        <div className="container-add-post">
            <AddPostLeft/>
            <AddPostRight/>
        </div>
    );
};

export default AddPost;