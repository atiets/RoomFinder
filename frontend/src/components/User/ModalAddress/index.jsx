import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./index.css";

const SelectWithLabel = ({ label, options, value, onChange }) => (
    <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>{label}</InputLabel>
        <Select
            value={value || ""}
            onChange={(event) => {
                const selected = options.find(
                    (option) => option.code === event.target.value
                );
                onChange(selected);
            }}
            label={label}
        >
            {options.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                    {option.name}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

const AddressModal = ({ open, onClose, onConfirm }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [addressDetail, setAddressDetail] = useState("");

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=3").then((res) => {
            setProvinces(res.data);
        });
    }, []);

    const handleProvinceChange = (value) => {
        setSelectedProvince(value);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts(value?.districts || []);
        setWards([]);
    };

    const handleDistrictChange = (value) => {
        setSelectedDistrict(value);
        setSelectedWard(null);
        setWards(value?.wards || []);
    };

    const handleWardChange = (value) => {
        setSelectedWard(value);
    };

    const handleSubmit = () => {
        const fullAddress = `${selectedProvince?.name || ""}, ${selectedDistrict?.name || ""}, ${selectedWard?.name || ""}, ${addressDetail}`;
        onConfirm(fullAddress);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paper': { width: '600px'} }}>
            <DialogTitle>Chọn Địa chỉ</DialogTitle>
            <DialogContent style={{display: "flex", flexDirection: "column", gap: 16 }}>
                <SelectWithLabel
                    label="Tỉnh/Thành phố"
                    options={provinces}
                    value={selectedProvince?.code}
                    onChange={handleProvinceChange}
                />
                <SelectWithLabel
                    label="Quận/Huyện"
                    options={districts}
                    value={selectedDistrict?.code}
                    onChange={handleDistrictChange}
                />
                <SelectWithLabel
                    label="Phường/Xã"
                    options={wards}
                    value={selectedWard?.code}
                    onChange={handleWardChange}
                />
                <TextField
                    label="Địa chỉ cụ thể"
                    size="small"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} className="update-profile-confirm-btn">
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddressModal;
