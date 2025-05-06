import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

// Sử dụng forwardRef để có thể truyền ref vào component
const SelectValue = React.forwardRef(({
    label,
    value,
    onChange,
    options,
    required = false,
    validationMessage = "Vui lòng chọn để tiếp tục"
}, ref) => {
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');
    const [touched, setTouched] = useState(false); // Mới thêm

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);
        setTouched(true); // Đánh dấu đã thao tác

        if (required && !val) {
            setError(true);
            setHelperText(validationMessage);
        } else {
            setError(false);
            setHelperText('');
        }
    };

    useEffect(() => {
        if (required && !value && touched) {
            setError(true);
            setHelperText(validationMessage);
        } else {
            setError(false);
            setHelperText('');
        }
    }, [value, required, validationMessage, touched]);

    return (
        <FormControl fullWidth size="small" error={error}>
            <InputLabel>
                {label}
                {required && <span className="add-post-right-require"> *</span>}
            </InputLabel>
            <Select
                ref={ref}  // Gán ref tại đây
                value={value}
                onChange={handleChange}
                label={typeof label === 'string' ? label : undefined}  // Tránh lỗi nếu label là JSX
            >
                <MenuItem value="">
                    <em>Chọn một giá trị</em>
                </MenuItem>
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
            {error && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
});

export default SelectValue;
