import { FormControl, InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import React, { useState } from 'react';

const ValidatedTextField = React.forwardRef(({
    label,
    value,
    onChange,
    required = false,
    maxLength,
    type = 'text',
    positiveOnly = false,
    onClick,
    readOnly = false,
    selectedCategory,
    typeArea,
    setTypeArea,
    multiline = false,
    rows = 1,
}, ref) => {
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');

    const formatNumber = (val) => {
        const num = val.replace(/,/g, ''); // Xóa dấu phẩy cũ
        if (isNaN(num)) return val;
        return Number(num).toLocaleString('en-US');
    };

    const validate = (val) => {
        const rawVal = val.replace(/,/g, '');
        if (required && rawVal.trim() === '') {
            setError(true);
            setHelperText('Trường này là bắt buộc.');
            return;
        }

        if (maxLength && rawVal.length > maxLength) {
            setError(true);
            setHelperText(`Không được vượt quá ${maxLength} ký tự.`);
            return;
        }

        if (['number', 'area', 'price'].includes(type)) {
            const onlyDigits = /^\d+$/;
            if (!onlyDigits.test(rawVal)) {
                setError(true);
                setHelperText('Chỉ được nhập số.');
                return;
            }

            const num = Number(rawVal);
            if (positiveOnly && num < 0) {
                setError(true);
                setHelperText('Phải là số dương.');
                return;
            }
        }

        setError(false);
        setHelperText('');
    };

    const handleChange = (e) => {
        let val = e.target.value;

        // Chỉ giữ lại chữ số và dấu phẩy (nếu có)
        if (['phone', 'number', 'area', 'price'].includes(type)) {
            val = val.replace(/[^0-9]/g, '');
        }

        if (type === 'price') {
            const formatted = formatNumber(val);
            onChange(formatted);
            validate(formatted);
        } else {
            onChange(val);
            validate(val);
        }
    };

    const handleKeyDown = (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        const isNumberKey = /^[0-9]$/.test(e.key);

        if (!isNumberKey && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <TextField
            ref={ref}
            fullWidth
            label={<>{label}{required && <span style={{ color: 'red' }}> *</span>}</>}
            value={value}
            onChange={handleChange}
            type={['phone', 'area', 'price'].includes(type) ? 'text' : type}
            error={error}
            helperText={helperText}
            size="small"
            onClick={onClick}
            multiline={multiline}
            rows={rows}
            InputProps={{
                readOnly,
                endAdornment: (
                    type === 'area' ? (
                        selectedCategory === 'Đất' ? (
                            <InputAdornment position="end">
                                <FormControl variant="standard" size="small">
                                    <Select
                                        value={typeArea}
                                        onChange={(e) => setTypeArea(e.target.value)}
                                        disableUnderline
                                        sx={{ fontSize: '14px' }}
                                    >
                                        <MenuItem value="m²">m²</MenuItem>
                                        <MenuItem value="hecta">hecta</MenuItem>
                                    </Select>
                                </FormControl>
                            </InputAdornment>
                        ) : (
                            <InputAdornment position="end" sx={{ color: '#999' }}>m²</InputAdornment>
                        )
                    ) : type === 'price' ? (
                        <InputAdornment position="end" sx={{ color: '#999' }}>VNĐ</InputAdornment>
                    ) : null
                )
            }}
            onKeyDown={['phone', 'number', 'area', 'price'].includes(type) ? handleKeyDown : undefined}
        />
    );
});

export default ValidatedTextField;
