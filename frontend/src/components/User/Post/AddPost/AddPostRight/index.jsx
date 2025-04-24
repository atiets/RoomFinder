import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, FormControl, IconButton, InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import React, { useState } from 'react';
import AddressModal from '../../../ModalAddress';
import HouseFeatureSelector from '../HouseFeatureSelector';
import ModalCategory from '../ModalCategory';
import SelectValue from '../SelectValue/SelectValue';
import './index.css';

const categories = ['Căn hộ/chung cư', 'Nhà ở', 'Đất', 'Văn phòng, mặt bằng kinh doanh', 'phòng trọ'];
const directionOptions = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Tây Nam", "Đông Bắc", "Tây Bắc"];
const apartmentTypes = ["Duplex", "Penthouse", "Căn hộ dịch vụ, mini", "Tập thể cư xá"];
const legalContractOptions = ['Hợp đồng đặt cọc', 'Hợp đồng mua bán', 'Sổ hồng riêng', 'Đang chờ sổ'];
const furnitureOptions = ['Nội thất cao cấp', 'Nội thất đầy đủ', 'Nhà thô'];
const propertyCategories = ['Nhà mặt phố, mặt tiền', 'Nhà ngõ hẻm', 'Nhà biệt thự', 'Nhà phố liền kề'];
const featuresOfHouse = ['Hẻm xe hơi', 'Nhà tóp hậu', 'Nhà chưa hoàn công', 'Đất chưa chuyển thổ', 'Nhà nở hậu', 'Nhà dính quy hoạch / lộ giới', 'Nhà nát', 'Hiện trạng khác'];
const featuresOfLand = ['Mặt tiền', 'Nở hậu', 'Thổ cư 1 phần', 'Không có thổ cư', 'Hẻm xe hơi', 'Chưa có thổ cư', 'Thổ cư toàn bộ', 'Hiện trạng khác'];
const typeOfLand = ['Đất thổ cư', 'Đất nền dự án', 'Đất nông nghiệp', 'Đất công nghiệp'];
const typeOfOffice = ['Mặt bằng kinh doanh', 'Văn phòng', 'Shophouse', 'Officetel'];

const bedroomOptions = [
    ...Array(10).fill().map((_, index) => (index + 1).toString()),
    'Nhiều hơn 10'
];
const bathroomOptions = [
    ...Array(10).fill().map((_, index) => (index + 1).toString()),
    'Nhiều hơn 10'
];
const AddPostRight = () => {
    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [openAddress, setOpenAddress] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [apartmentType, setApartmentType] = useState('');
    const [bedroomCount, setBedroomCount] = useState('');
    const [bathroomCount, setBathroomCount] = useState('');
    const [balconyDirection, setBalconyDirection] = useState('');
    const [mainDoorDirection, setMainDoorDirection] = useState('');
    const [legalContract, setLegalContract] = useState('');
    const [furnitureStatus, setFurnitureStatus] = useState('');
    const [transactionType, setTransactionType] = useState('Cho thuê');
    const [propertyCategory, setPropertyCategory] = useState('');
    const [floorCount, setFloorCount] = useState(0);
    const [selectedFeaturesOfHouse, setSelectedFeaturesOfHouse] = useState([]);
    const [selectedFeaturesOfLand, setSelectedFeaturesOfLand] = useState([]);
    const [typeLand, setTypeLand] = useState('');
    const [typeOffice, setTypeOffice] = useState('');
    const [lanDirection, setLandDirection] = useState('');
    const [area, setArea] = useState('');
    const [unit, setUnit] = useState('m²');

    const handleLandDirection = (event) => {
        setLandDirection(event.target.value);
    };


    const handleTypeOffice = (event) => {
        setTypeOffice(event.target.value);
    };

    const handleTypeLand = (event) => {
        setTypeLand(event.target.value);
    };

    const handleFloorCountChange = (event) => {
        const value = event.target.value;
        setFloorCount(value === '' ? 0 : Number(value));
    };

    const handlePropertyCategoryChange = (event) => {
        setPropertyCategory(event.target.value);
    };

    const handleFurnitureChange = (event) => {
        setFurnitureStatus(event.target.value);
    };

    const handleLegalContractChange = (event) => {
        setLegalContract(event.target.value);
    };

    const handleMainDoorChange = (event) => {
        setMainDoorDirection(event.target.value);
    };

    const handleBalconyChange = (event) => {
        setBalconyDirection(event.target.value);
    };

    const handleBathroomChange = (event) => {
        setBathroomCount(event.target.value);
    };

    const handleBedroomChange = (event) => {
        setBedroomCount(event.target.value);
    };

    const handleApartmentTypeChange = (event) => {
        setApartmentType(event.target.value);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleOpenAddress = () => setOpenAddress(true);
    const handleCloseAddress = () => setOpenAddress(false);

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        handleClose();
    };



    return (
        <div className="container-add-post-right">
            <div className='add-post-right-header'>
                <div className='add-post-right-header-category'>
                    <TextField
                        label="Chọn danh mục bất động sản"
                        fullWidth
                        value={selectedCategory}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        size='small'
                        onClick={handleOpen}
                    />
                    <ModalCategory
                        open={open}
                        onClose={handleClose}
                        onSelect={handleSelectCategory}
                        categories={categories}
                    />
                </div>
                {selectedCategory !== 'phòng trọ' && (
                    <div className='add-post-right-header-type-transaction'>
                        <p className='add-post-right-header-label'>Chọn loại giao dịch<span className="add-post-right-require">*</span></p>
                        <div className='add-post-right-header-container-transaction'>
                            <Button
                                className={`add-post-right-transaction-btn ${transactionType === 'Cho thuê' ? 'selected' : ''
                                    }`}
                                onClick={() => setTransactionType('Cho thuê')}
                            >
                                Cho thuê
                            </Button>
                            <Button
                                className={`add-post-right-transaction-btn ${transactionType === 'Cần bán' ? 'selected' : ''
                                    }`}
                                onClick={() => setTransactionType('Cần bán')}
                            >
                                Cần bán
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div className='add-post-right-address'>
                <h2 className='add-post-right-title'>Địa chỉ</h2>
                {selectedCategory !== 'phòng trọ' && (
                    <TextField
                        label={
                            selectedCategory === 'Đất' ? (
                                "Tên dự án đất nền"
                            ) : (
                                "Tên tòa nhà, khu dân cư"
                            )
                        }
                        size="small"
                        fullWidth
                    />
                )}
                <TextField
                    label={<>Địa chỉ<span className="add-post-right-require">*</span></>}
                    size="small"
                    fullWidth
                    onClick={handleOpenAddress}
                    value={selectedAddress || address}
                />
                <AddressModal
                    open={openAddress}
                    onClose={handleCloseAddress}
                    onConfirm={(fullAddress) => {
                        setSelectedAddress(fullAddress);
                        setAddress(fullAddress);
                    }}
                />
            </div>
            {selectedCategory !== 'phòng trọ' && (
                <div className='add-post-right-location'>
                    <h2 className='add-post-right-title'>Vị trí bất động sản</h2>
                    <div className="add-post-right-location-info">
                        {selectedCategory === 'Nhà ở' || selectedCategory === 'Đất' ? (
                            <>
                                <div>
                                    <TextField label="Mã căn" variant="outlined" fullWidth size="small" />
                                </div>
                                <div>
                                    <TextField label="Tên phân khu/lô" variant="outlined" fullWidth size="small" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <TextField label="Mã căn" variant="outlined" fullWidth size="small" />
                                </div>
                                <div>
                                    <TextField label="Block, Tháp" variant="outlined" fullWidth size="small" />
                                </div>
                                <div>
                                    <TextField label="Tầng số" variant="outlined" fullWidth size="small" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {selectedCategory !== 'phòng trọ' && (
                <div className='add-post-right-info-detail'>
                    <h2 className='add-post-right-title'>Thông tin chi tiết</h2>
                    <div className='add-post-right-info-detail-container'>
                        <div className='add-post-right-info-detail-container-item full-width'>
                            {selectedCategory === 'Nhà ở' ? (
                                <SelectValue
                                    label={<>Loại hình nhà ở<span className="add-post-right-require">*</span></>}
                                    value={propertyCategory}
                                    onChange={handlePropertyCategoryChange}
                                    options={propertyCategories}
                                />
                            ) : selectedCategory === 'Căn hộ/chung cư' ? (
                                <SelectValue
                                    label={<>Loại hình căn hộ<span className="add-post-right-require">*</span></>}
                                    value={apartmentType}
                                    onChange={handleApartmentTypeChange}
                                    options={apartmentTypes}
                                />
                            ) : selectedCategory === 'Đất' ? (
                                <SelectValue
                                    label={<>Loại hình đất<span className="add-post-right-require">*</span></>}
                                    value={typeLand}
                                    onChange={handleTypeLand}
                                    options={typeOfLand}
                                />
                            ) : selectedCategory === 'Văn phòng, mặt bằng kinh doanh' ? (
                                <SelectValue
                                    label={<>Loại hình văn phòng<span className="add-post-right-require">*</span></>}
                                    value={typeOffice}
                                    onChange={handleTypeOffice}
                                    options={typeOfOffice}
                                />
                            ) : null}
                        </div>
                        {(selectedCategory !== 'Đất' && selectedCategory !== 'Văn phòng, mặt bằng kinh doanh') ? (
                            <>
                                <div className='add-post-right-info-detail-container-item'>
                                    <SelectValue
                                        label="Số phòng ngủ"
                                        value={bedroomCount}
                                        onChange={handleBedroomChange}
                                        options={bedroomOptions}
                                    />
                                </div>
                                <div className='add-post-right-info-detail-container-item'>
                                    <SelectValue
                                        label="Số phòng vệ sinh"
                                        value={bathroomCount}
                                        onChange={handleBathroomChange}
                                        options={bathroomOptions}
                                    />
                                </div>
                                <div className='add-post-right-info-detail-container-item'>
                                    {selectedCategory === 'Nhà ở' ? (
                                        <TextField
                                            label="Tổng số tầng"
                                            type="number"
                                            value={floorCount === 0 ? '' : floorCount}
                                            onChange={handleFloorCountChange}
                                            fullWidth
                                            size="small"
                                            InputProps={{
                                                inputProps: { min: 0 },
                                            }}
                                        />
                                    ) : (
                                        <SelectValue
                                            label="Hướng ban công"
                                            value={balconyDirection}
                                            onChange={handleBalconyChange}
                                            options={directionOptions}
                                        />
                                    )}
                                </div>
                            </>
                        ) : null}
                        {selectedCategory !== 'Đất' ? (
                            <div className='add-post-right-info-detail-container-item'>
                                <SelectValue
                                    label="Hướng cửa chính"
                                    value={mainDoorDirection}
                                    onChange={handleMainDoorChange}
                                    options={directionOptions}
                                />
                            </div>
                        ) : (
                            <SelectValue
                                label="Hướng đất"
                                value={lanDirection}
                                onChange={handleLandDirection}
                                options={directionOptions}
                            />)}
                    </div>
                </div>
            )}
            <div className='add-post-right-other-info'>
                <h2 className='add-post-right-title'>Thông tin khác</h2>
                <div className='add-post-right-other-info-container'>
                    {!(
                        (selectedCategory === 'Văn phòng, mặt bằng kinh doanh' && transactionType === 'Cho thuê') ||
                        selectedCategory === 'phòng trọ'
                    ) && (
                            <div>
                                <SelectValue
                                    label={<>Giấy tờ pháp lý<span className="add-post-right-require">*</span></>}
                                    value={legalContract}
                                    onChange={handleLegalContractChange}
                                    options={legalContractOptions}
                                />
                            </div>
                        )}
                    {selectedCategory !== 'Đất' && (
                        <div>
                            <SelectValue
                                label="Tình trạng nội thất"
                                value={furnitureStatus}
                                onChange={handleFurnitureChange}
                                options={furnitureOptions}
                            />
                        </div>
                    )}
                </div>
                {selectedCategory === 'Nhà ở' && (
                    <HouseFeatureSelector
                        features={featuresOfHouse}
                        selectedFeatures={selectedFeaturesOfHouse}
                        setSelectedFeatures={setSelectedFeaturesOfHouse}
                    />
                )}
                {selectedCategory === 'Đất' && (
                    <HouseFeatureSelector
                        features={featuresOfLand}
                        selectedFeatures={selectedFeaturesOfLand}
                        setSelectedFeatures={setSelectedFeaturesOfLand}
                    />
                )}
            </div>
            <div className='add-post-right-price'>
                <h2 className='add-post-right-title'>Diện tích và giá</h2>
                <div className='add-post-right-price-container'>
                    <div className='add-post-right-price-container-item full-width'>
                        <TextField
                            label={<>Diện tích<span className="add-post-right-require">*</span></>}
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            type="number"
                            fullWidth
                            size="small"
                            variant="outlined"
                            InputProps={{
                                endAdornment: selectedCategory === 'Đất' && (
                                    <InputAdornment position="end">
                                        <FormControl variant="standard" size="small">
                                            <Select
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                disableUnderline
                                                sx={{ fontSize: '14px' }}
                                            >
                                                <MenuItem value="m²">m²</MenuItem>
                                                <MenuItem value="hecta">hecta</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                    {selectedCategory === 'Nhà ở' && (
                        <div className='add-post-right-price-container-item full-width'>
                            <TextField
                                label={<>Diện tích đất sử dụng<span className="add-post-right-require">*</span></>}
                                variant="outlined"
                                fullWidth
                                size="small"
                            />
                        </div>
                    )}
                    {["Nhà ở", "Đất", "Văn phòng, mặt bằng kinh doanh"].includes(selectedCategory) && (
                        <>
                            <div className='add-post-right-price-container-item'>
                                <TextField label={<span>Chiều ngang <span className="add-post-right-require">*</span></span>} variant="outlined" fullWidth size="small" />
                            </div>
                            <div className='add-post-right-price-container-item'>
                                <TextField label={<span>Chiều dài <span className="add-post-right-require">*</span></span>} variant="outlined" fullWidth size="small" />
                            </div>
                        </>
                    )}
                </div>
                {(selectedCategory === 'phòng trọ' || transactionType === 'Cho thuê') && (
                    <>
                        <TextField
                            label={<>Giá thuê <span className="add-post-right-require">*</span></>}
                            variant="outlined"
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label={<>Tiền cọc <span className="add-post-right-require">*</span></>}
                            variant="outlined"
                            fullWidth
                            size="small"
                        />
                    </>
                )}
                {transactionType === 'Cần bán' && selectedCategory !== 'phòng trọ' && (
                    <TextField
                        label={<>Giá bán <span className="add-post-right-require">*</span></>}
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mt: 2 }}
                    />
                )}
            </div>
            <div className='add-post-right-title-content'>
                <h2 className='add-post-right-title'>Tiêu đề và mô tả của tin đăng</h2>
                <TextField
                    label={<>Tiêu đề<span className="add-post-right-require">*</span></>}
                    variant="outlined"
                    fullWidth size='small' />
                <TextField
                    label={<>Mô tả<span className="add-post-right-require">*</span></>}
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    size='small'
                />
            </div>
            <div className='add-post-right-title-content'>
                <p className='add-post-right-header-label'>Bạn là<span className="add-post-right-require">*</span></p>
                <div className='add-post-right-header-container-transaction'>
                    <Button className='add-post-right-transaction-btn'>Cá nhân</Button>
                    <Button className='add-post-right-transaction-btn'>Mô giới</Button>
                </div>
            </div>
        </div>
    );
};

export default AddPostRight;