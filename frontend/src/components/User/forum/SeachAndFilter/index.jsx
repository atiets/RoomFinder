import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
    Button,
    InputAdornment,
    Menu,
    MenuItem,
    TextField,
} from '@mui/material';
import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreadsTags } from '../../../../redux/threadApi';
import './index.css';

const SeachAndFilter = ({ onSearchChange }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [searchText, setSearchText] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('newest');
    const [allTags, setAllTags] = useState([]);
    const [topTags, setTopTags] = useState([]);
    const [searchTagText, setSearchTagText] = useState("");

    // Mở filter menu
    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Đóng filter menu và chọn loại filter
    const handleFilterClose = (option) => {
        if (option) {
            setSelectedFilter(option);
            triggerSearch(searchText, selectedTag, option);
        }
        setAnchorEl(null);
    };

    // Gửi sự kiện khi nhấn Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            triggerSearch(searchText, selectedTag, selectedFilter);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        debouncedSearch(value, selectedTag, selectedFilter);
    };

    const triggerSearch = (keyword, tags, filter) => {
        if (onSearchChange) {
            onSearchChange({ keyword, tags, sortBy: filter });
        }

        const query = new URLSearchParams({
            q: keyword || '',
            tags: tags || '',
            sort: filter || 'newest'
        });

        navigate(`/search-threads?${query.toString()}`);
    };

    // debounce input
    const debouncedSearch = useMemo(
        () =>
            debounce((keyword, tags, filter) => {
                triggerSearch(keyword, tags, filter);
            }, 500),
        [] // chỉ khởi tạo 1 lần
    );

    // cleanup debounce khi unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    //Lấy tất cả tag từ backend
    useEffect(() => {
        const fetchAllTags = async () => {
            try {
                const response = await getThreadsTags();
                setAllTags(response?.data?.allTags || []);
                setTopTags(response?.data?.top8Tags || []);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchAllTags();
    }, []);

    const handleTagClick = (tag) => {
        setSelectedTag(tag);
        triggerSearch(searchText, tag, selectedFilter);
    };

    return (
        <div className="talent-search-container">
            <div className="top-search-bar">
                <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm theo từ khóa, tên, mô tả, khu vực,.."
                    className="top-search-input"
                    size="small"
                    value={searchText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon
                                    className="search-icon"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        triggerSearch(searchText, selectedTag, selectedFilter)
                                    }
                                />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>

            <div className="talent-section">
                <div className="talent-search-filter">
                    <h2 className="talent-title">Tags</h2>
                    <TextField
                        variant="outlined"
                        placeholder="Search tags"
                        className="talent-search-input"
                        size="small"
                        value={searchTagText}
                        onChange={(e) => setSearchTagText(e.target.value)}
                    />

                    <Button
                        variant="outlined"
                        className="filter-dropdown-btn"
                        onClick={handleFilterClick}
                        startIcon={<FilterListIcon />}
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => handleFilterClose(null)}
                        MenuListProps={{ disablePadding: true }}
                    >
                        <MenuItem
                            onClick={() => handleFilterClose('newest')}
                            sx={{ padding: '4px 8px' }}
                        >
                            📅 Mới nhất
                        </MenuItem>
                        <MenuItem
                            onClick={() => handleFilterClose('oldest')}
                            sx={{ padding: '4px 8px' }}
                        >
                            📜 Cũ nhất
                        </MenuItem>
                    </Menu>
                </div>
                {/* Chỉ hiển thị top tags khi ô tìm kiếm rỗng */}
                {/* Top Tags (chỉ khi không search) */}
                {!searchTagText.trim() && (
                    <div className="filter-buttons">
                        {topTags.map((tag, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                className={`filter-btn ${selectedTag === tag ? "selected-tag" : ""}`}
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Filtered Tags (chỉ khi đang search) */}
                {searchTagText.trim() && (
                    <div className="filtered-tags">
                        {allTags
                            .filter(tag => tag.toLowerCase().includes(searchTagText.toLowerCase()))
                            .slice(0, 10)
                            .map((tag, index) => (
                                <Button
                                    key={index}
                                    variant="outlined"
                                    className={`filter-btn ${selectedTag === tag ? "selected-tag" : ""}`}
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </Button>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeachAndFilter;
