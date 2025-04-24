import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

function SelectValue({ label, value, onChange, options }) {
    return (
        <FormControl fullWidth size="small" sx={{ padding: 0 }}>
            <InputLabel sx={{ padding: 0 }}>{label}</InputLabel>
            <Select
                value={value}
                onChange={onChange}
                label={label}
                sx={{ padding: 0 }} // Tắt padding của Select
            >
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default SelectValue;
