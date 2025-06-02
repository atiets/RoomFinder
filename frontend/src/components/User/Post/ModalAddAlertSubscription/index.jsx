import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
    Button,
    IconButton,
    InputAdornment,
    MenuItem,
    Modal,
    TextField
} from '@mui/material';
import axios from "axios";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { createAlertSubscription } from '../../../../redux/AlertSubscription';
import HouseFeatureSelector from '../AddPost/HouseFeatureSelector';
import ModalCategory from '../AddPost/ModalCategory';
import SelectValue from '../AddPost/SelectValue/SelectValue';
import ValidatedTextField from '../ValidatedTextField';
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

const AlertSubscription = ({ post }) => {
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const token = currentUser?.accessToken;
    const user = currentUser?._id;

    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [apartmentType, setApartmentType] = useState('');
    const [bedroomCount, setBedroomCount] = useState('');
    const [bathroomCount, setBathroomCount] = useState('');
    const [balconyDirection, setBalconyDirection] = useState('');
    const [mainDoorDirection, setMainDoorDirection] = useState('');
    const [legalContract, setLegalContract] = useState('');
    const [furnitureStatus, setFurnitureStatus] = useState('');
    const [transactionType, setTransactionType] = useState('Cần thuê');
    const [propertyCategory, setPropertyCategory] = useState('');
    const [floorCount, setFloorCount] = useState(0);
    const [features, setFeatures] = useState([]);
    const [lanDirection, setLandDirection] = useState('');
    const [typeArea, setTypeArea] = useState('m²');
    const [areaRange, setAreaRange] = useState({ min: '', max: '' });
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [notifyMethod, setNotifyMethod] = useState('email');

    useEffect(() => {
        if (post) {
            setSelectedCategory(post?.category || '');
            setApartmentType(post?.propertyDetails?.apartmentType || '');
            setBedroomCount(post?.propertyDetails?.bedroomCount || '');
            setBathroomCount(post?.propertyDetails?.bathroomCount || '');
            setBalconyDirection(post?.propertyDetails?.balconyDirection || '');
            setMainDoorDirection(post?.propertyDetails?.mainDoorDirection || '');
            setLegalContract(post?.legalContract || '');
            setFurnitureStatus(post?.furnitureStatus || '');
            if (post.transactionType === "Cần bán") {
                setTransactionType("Cần mua");
            } else if (post.transactionType === "Cho thuê") {
                setTransactionType("Cần thuê");
            } else {
                setTransactionType(post?.transactionType || '');
            }
            setPropertyCategory(post?.propertyDetails?.propertyCategory || '');
            setFloorCount(post?.propertyDetails?.floorCount ?? 0);
            setFeatures(post?.features || []);
            setLandDirection(post?.propertyDetails?.landDirection || '');
            setTypeArea(post?.typeArea || 'm²');
            setAreaRange(post?.areaRange || { min: '', max: '' });
            setPriceRange(post?.priceRange || { min: '', max: '' });
            setSelectedProvince(post?.address?.province || null);
            setSelectedDistrict(post?.address?.district || null);
        }
    }, [post]);

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=3").then((res) => {
            setProvinces(res.data);
        });
    }, []);

    useEffect(() => {
        if (post?.address?.province && provinces.length > 0) {
            const province = provinces.find(p => p.name === post.address.province);
            if (province) {
                setSelectedProvince(province);
                setDistricts(province.districts || []);
            }
        }
    }, [post?.address?.province, provinces]);

    useEffect(() => {
        if (post?.address?.district && districts.length > 0) {
            const district = districts.find(d => d.name === post.address.district);
            if (district) {
                setSelectedDistrict(district);
            }
        }
    }, [post?.address?.district, districts]);

    const handleProvinceChange = (event) => {
        const province = provinces.find(p => p.code === event.target.value);
        setSelectedProvince(province);
        setDistricts(province?.districts || []);
        setSelectedDistrict(null);
    };

    const handleDistrictChange = (event) => {
        const district = districts.find(d => d.code === event.target.value);
        setSelectedDistrict(district);
    };

    useEffect(() => {
        if (post?.area && post?.price && post?.typeArea) {
            // Tính khoảng cách diện tích
            let areaDelta = 0;
            if (post.typeArea === "m²") {
                areaDelta = 10;
            } else if (post.typeArea === "hecta") {
                areaDelta = 1;
            }

            const minArea = Math.max(0, post.area - areaDelta);
            const maxArea = post.area + areaDelta;

            setAreaRange({
                min: minArea,
                max: maxArea,
            });

            // Tính khoảng cách giá
            const priceDelta = post.price >= 1_000_000_000 ? 500_000_000 : 1_000_000;
            const minPrice = Math.max(0, post.price - priceDelta);
            const maxPrice = post.price + priceDelta;

            setPriceRange({
                min: minPrice,
                max: maxPrice,
            });
        }
    }, [post?.area, post?.price, post?.typeArea]);

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        handleCloseModalCategory();
    };

    const handleLandDirection = (event) => {
        setLandDirection(event);
    };

    const handleTypeOffice = (event) => {
        setPropertyCategory(event);
    };

    const handleTypeLand = (event) => {
        setPropertyCategory(event);
    };
    const handleFloorCountChange = (event) => {
        setFloorCount(event);
    };

    const handlePropertyCategoryChange = (event) => {
        setPropertyCategory(event);
    };

    const handleFurnitureChange = (event) => {
        setFurnitureStatus(event);
    };

    const handleLegalContractChange = (event) => {
        setLegalContract(event);
    };

    const handleMainDoorChange = (event) => {
        setMainDoorDirection(event);
    };

    const handleBalconyChange = (event) => {
        setBalconyDirection(event);
    };

    const handleBathroomChange = (event) => {
        setBathroomCount(event);
    };

    const handleBedroomChange = (event) => {
        setBedroomCount(event);
    };

    const handleApartmentTypeChange = (event) => {
        setApartmentType(event);
    };

    const handleChange = (e) => {
        setNotifyMethod(e.target.value);
    };

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    const handleOpenModalCategory = () => setOpen(true);
    const handleCloseModalCategory = () => setOpen(false);


    const handleSubmit = async () => {
        if (!selectedCategory) {
            toast.error("Vui lòng chọn loại hình bất động sản");
            return;
        }

        if (!transactionType) {
            toast.error("Vui lòng chọn loại giao dịch");
            return;
        }

        if (!selectedProvince || !selectedDistrict) {
            toast.error("Vui lòng chọn tỉnh/thành và quận/huyện");
            return;
        }

        if (!priceRange.min || !priceRange.max) {
            toast.error("Vui lòng nhập khoảng giá");
            return;
        }

        if (!areaRange.min || !areaRange.max) {
            toast.error("Vui lòng nhập khoảng diện tích");
            return;
        }

        if (!notifyMethod) {
            toast.error("Vui lòng chọn phương thức thông báo");
            return;
        }

        const subscriptionData = {
            category: selectedCategory,
            transactionType: transactionType,
            address: {
                province: selectedProvince?.name || selectedProvince || '',
                district: selectedDistrict?.name || selectedDistrict || '',
            },
            propertyDetails: {
                propertyCategory,
                apartmentType,
                bedroomCount,
                bathroomCount,
                floorCount,
                balconyDirection,
                mainDoorDirection,
                landDirection: lanDirection,
            },
            legalContract,
            furnitureStatus,
            priceRange: {
                min: Number(priceRange.min),
                max: Number(priceRange.max),
            },
            areaRange: {
                min: Number(areaRange.min),
                max: Number(areaRange.max),
            },
            typeArea,
            features,
            notifyMethod,
        };

        try {
            const result = await createAlertSubscription(subscriptionData, token);
            toast.success("Đăng ký thông báo thành công!");
            handleClose();
        } catch (error) {
            toast.error("Đã có lỗi xảy ra khi đăng ký thông báo!");
            console.error(error);
        }
    };

    return (
        <div className="alert-subscription-container">
            <Button
                variant="contained"
                className="alert-subscription-button"
                startIcon={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsActiveIcon />
                    </span>
                }
                onClick={handleOpen}
            >
                Gửi tôi bài viết tương tự
            </Button>

            <Modal
                open={openModal}
                onClose={handleClose}
                className="modal-add-alert-subscription-container"
            >
                <div className='modal-add-alert-subscription-content' >
                    <div className='add-alert-subscription-header'>
                        <div className='add-alert-subscription-title' >
                            <text className='add-alert-subscription-title-text'>
                                Gửi thông tin bài viết mong muốn
                            </text>
                        </div>
                        <div className='add-alert-subscription-header-category'>
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
                                onClick={handleOpenModalCategory}
                            />
                            <ModalCategory
                                open={open}
                                onClose={handleCloseModalCategory}
                                onSelect={handleSelectCategory}
                                categories={categories}
                            />
                        </div>

                        {selectedCategory !== 'phòng trọ' && (
                            <div className='add-alert-subscription-header-transaction'>
                                <p className='add-alert-subscription-header-label'>
                                    Chọn loại giao dịch<span className="add-alert-subscription-required">*</span>
                                </p>
                                <div className='add-alert-subscription-transaction-container'>
                                    <Button
                                        className={`add-alert-subscription-transaction-btn ${transactionType === 'Cần thuê' ? 'selected' : ''}`}
                                        onClick={() => setTransactionType("Cần thuê")}
                                    >
                                        Cần thuê
                                    </Button>
                                    <Button
                                        className={`add-alert-subscription-transaction-btn ${transactionType === 'Cần mua' ? 'selected' : ''}`}
                                        onClick={() => setTransactionType("Cần mua")}
                                    >
                                        Cần mua
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {selectedCategory ? (
                        <>
                            <div className='add-alert-subscription-address'>
                                <h2 className='add-alert-subscription-title'>Địa chỉ</h2>
                                <div className='add-alert-subscription-address-select-group'>
                                    <div className='add-alert-subscription-select-box'>
                                        <TextField
                                            select
                                            label="Tỉnh/Thành phố"
                                            fullWidth
                                            value={selectedProvince?.code || ''}
                                            onChange={handleProvinceChange}
                                            size='small'
                                        >
                                            {provinces.map((province) => (
                                                <MenuItem key={province.code} value={province.code}>
                                                    {province.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </div>

                                    <div className='add-alert-subscription-select-box'>
                                        <TextField
                                            select
                                            label="Quận/Huyện"
                                            fullWidth
                                            value={selectedDistrict?.code || ''}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedProvince}
                                            size='small'
                                        >
                                            {districts.map((district) => (
                                                <MenuItem key={district.code} value={district.code}>
                                                    {district.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </div>
                                </div>
                            </div>
                            {selectedCategory !== 'phòng trọ' && (
                                <div className='add-alert-subscription-info-detail'>
                                    <h2 className='add-alert-subscription-title'>Thông tin chi tiết</h2>
                                    <div className='add-alert-subscription-info-detail-grid'>
                                        <div className='add-alert-subscription-info-item full-span'>
                                            {selectedCategory === 'Nhà ở' ? (
                                                <SelectValue
                                                    label="Loại hình nhà ở"
                                                    value={propertyCategory}
                                                    onChange={handlePropertyCategoryChange}
                                                    options={propertyCategories}
                                                    required={true}
                                                    validationMessage="Vui lòng chọn loại hình nhà ở"
                                                />
                                            ) : selectedCategory === 'Căn hộ/chung cư' ? (
                                                <SelectValue
                                                    label="Loại hình căn hộ"
                                                    value={apartmentType}
                                                    onChange={handleApartmentTypeChange}
                                                    options={apartmentTypes}
                                                    required={true}
                                                    validationMessage="Vui lòng chọn loại hình căn hộ"
                                                />
                                            ) : selectedCategory === 'Đất' ? (
                                                <SelectValue
                                                    label="Loại hình đất"
                                                    value={propertyCategory}
                                                    onChange={handleTypeLand}
                                                    options={typeOfLand}
                                                />
                                            ) : selectedCategory === 'Văn phòng, mặt bằng kinh doanh' ? (
                                                <SelectValue
                                                    label="Loại hình văn phòng, mặt bằng kinh doanh"
                                                    value={propertyCategory}
                                                    onChange={handleTypeOffice}
                                                    options={typeOfOffice}
                                                />
                                            ) : null}
                                        </div>

                                        {(selectedCategory !== 'Đất' && selectedCategory !== 'Văn phòng, mặt bằng kinh doanh') && (
                                            <>
                                                <div className='add-alert-subscription-info-item'>
                                                    <SelectValue
                                                        label="Số phòng ngủ"
                                                        value={bedroomCount}
                                                        onChange={handleBedroomChange}
                                                        options={bedroomOptions}
                                                    />
                                                </div>
                                                <div className='add-alert-subscription-info-item'>
                                                    <SelectValue
                                                        label="Số phòng vệ sinh"
                                                        value={bathroomCount}
                                                        onChange={handleBathroomChange}
                                                        options={bathroomOptions}
                                                    />
                                                </div>
                                                <div className='add-alert-subscription-info-item'>
                                                    {selectedCategory === 'Nhà ở' ? (
                                                        <ValidatedTextField
                                                            label="Tổng số tầng"
                                                            type="number"
                                                            value={floorCount === 0 ? '' : floorCount}
                                                            onChange={handleFloorCountChange}
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
                                        )}

                                        {selectedCategory !== 'Đất' ? (
                                            <div className='add-alert-subscription-info-item'>
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
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className='add-alert-subscription-other-info'>
                                <h2 className='add-alert-subscription-title'>Thông tin khác</h2>
                                <div className='add-alert-subscription-other-info-grid'>
                                    {!(
                                        (selectedCategory === 'Văn phòng, mặt bằng kinh doanh' && transactionType === 'Cho thuê') ||
                                        selectedCategory === 'phòng trọ'
                                    ) && (
                                            <div>
                                                <SelectValue
                                                    label="Giấy tờ pháp lý"
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
                                        selectedFeatures={features}
                                        setSelectedFeatures={setFeatures}
                                    />
                                )}

                                {selectedCategory === 'Đất' && (
                                    <HouseFeatureSelector
                                        features={featuresOfLand}
                                        selectedFeatures={features}
                                        setSelectedFeatures={setFeatures}
                                    />
                                )}
                            </div>
                            <div className='add-alert-subscription-area-price'>
                                <h2 className='add-alert-subscription-title'>Diện tích và giá</h2>
                                <div className='add-alert-subscription-area-price-grid'>
                                    <div className='add-alert-subscription-area-price-grid-item'>
                                        <ValidatedTextField
                                            label="Diện tích từ"
                                            value={areaRange.min}
                                            onChange={(val) => setAreaRange((prev) => ({ ...prev, min: val }))}
                                            required
                                            type="area"
                                            selectedCategory={selectedCategory}
                                            typeArea={typeArea}
                                            setTypeArea={setTypeArea}
                                        />
                                    </div>
                                    <div className='add-alert-subscription-area-price-grid-item'>
                                        <ValidatedTextField
                                            label="Diện tích đến"
                                            value={areaRange.max}
                                            onChange={(val) => setAreaRange((prev) => ({ ...prev, max: val }))}
                                            required
                                            type="area"
                                            selectedCategory={selectedCategory}
                                            typeArea={typeArea}
                                            setTypeArea={setTypeArea}
                                        />
                                    </div>
                                    <div className='add-alert-subscription-area-price-grid-item'>
                                        <ValidatedTextField
                                            label="Giá từ"
                                            value={priceRange.min}
                                            onChange={(val) => setPriceRange((prev) => ({ ...prev, min: val }))}
                                            required
                                            type="number"
                                        />
                                    </div>
                                    <div className='add-alert-subscription-area-price-grid-item'>
                                        <ValidatedTextField
                                            label="Giá đến"
                                            value={priceRange.max}
                                            onChange={(val) => setPriceRange((prev) => ({ ...prev, max: val }))}
                                            required
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='add-alert-subscription-notifyMethod'>
                                <h3 className='notifyMethod-title'>Nhận thông báo qua</h3>

                                <div className='notifyMethod-options'>
                                    <label className='notifyMethod-option'>
                                        <input
                                            type="radio"
                                            name="notifyMethod"
                                            value="email"
                                            checked={notifyMethod === 'email'}
                                            onChange={handleChange}
                                        />
                                        <span className="custom-radio"></span>
                                        Email
                                    </label>

                                    <label className='notifyMethod-option'>
                                        <input
                                            type="radio"
                                            name="notifyMethod"
                                            value="web"
                                            checked={notifyMethod === 'web'}
                                            onChange={handleChange}
                                        />
                                        <span className="custom-radio"></span>
                                        Ứng dụng
                                    </label>

                                    <label className='notifyMethod-option'>
                                        <input
                                            type="radio"
                                            name="notifyMethod"
                                            value="both"
                                            checked={notifyMethod === 'both'}
                                            onChange={handleChange}
                                        />
                                        <span className="custom-radio"></span>
                                        Cả 2
                                    </label>
                                </div>
                            </div>
                            <div className='add-post-right-container-submit'>
                                <Button className='add-alert-subscription-btn-submit' onClick={handleSubmit}>Gửi thông tin</Button>
                            </div>
                        </>
                    ) : (
                        <div className='add-post-right-notice'>
                            Vui lòng chọn loại bất động sản để tiếp tục.
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AlertSubscription;
