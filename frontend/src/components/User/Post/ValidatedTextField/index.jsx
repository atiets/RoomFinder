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
}, ref) => { // ref là tham số thứ hai
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');

    const validate = (val) => {
        if (required && val.trim() === '') {
            setError(true);
            setHelperText('Trường này là bắt buộc.');
            return;
        }

        if (maxLength && val.length > maxLength) {
            setError(true);
            setHelperText(`Không được vượt quá ${maxLength} ký tự.`);
            return;
        }

        if (type === 'number' || type === 'area') {
            const onlyDigits = /^\d+$/;
            if (!onlyDigits.test(val)) {
                setError(true);
                setHelperText('Chỉ được nhập số.');
                return;
            }

            const num = Number(val);
            if (positiveOnly && num < 0) {
                setError(true);
                setHelperText('Phải là số dương.');
                return;
            }
        }

        if (type === 'phone') {
            const phoneRegex = /^[0-9]{9,11}$/;
            if (!phoneRegex.test(val)) {
                setError(true);
                setHelperText('Số điện thoại không hợp lệ (9–11 chữ số).');
                return;
            }
        }

        setError(false);
        setHelperText('');
    };

    const handleChange = (e) => {
        const val = e.target.value;

        if ((type === 'phone' || type === 'number' || type === 'area') && /[^0-9]/.test(val)) {
            return;
        }

        onChange(val);
        validate(val);
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
            type={type === 'phone' || type === 'area' ? 'text' : type}
            error={error}
            helperText={helperText}
            size="small"
            onClick={onClick}
            multiline={multiline}
            rows={rows}
            InputProps={{
                readOnly,
                endAdornment: type === 'area' && selectedCategory === 'Đất' ? (
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
                    type === 'area' && selectedCategory !== 'Đất' && (
                        <InputAdornment position="end" sx={{ color: '#999' }}>m²</InputAdornment>
                    )
                )
            }}
            onKeyDown={(type === 'phone' || type === 'number' || type === 'area') ? handleKeyDown : undefined}
        />
    );
});

export default ValidatedTextField;
