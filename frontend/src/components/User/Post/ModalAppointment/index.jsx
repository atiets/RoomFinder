import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React, { useState } from 'react';
import './index.css';

const ModalAppointment = ({ visible, onClose, onSubmit }) => {
    const [formValues, setFormValues] = useState({
        name: '',
        phỏne: '',
        date: null,
        time: null,
        note: '',
    });

    const handleChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formValues);
        setFormValues({ name: '', phone: '', date: null, time: null, note: '' });
    };

    return (
        <Dialog open={visible} onClose={onClose} fullWidth>
            <DialogTitle>Đặt lịch hẹn</DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <TextField
                        label="Tên người đặt"
                        size="small"
                        value={formValues.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Số điện thoại"
                        size="small"
                        value={formValues.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        fullWidth
                    />
                </div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack direction="row" spacing={2}>
                        <DatePicker
                            label="Ngày"
                            value={formValues.date}
                            onChange={(value) => handleChange("date", value)}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    required: true,
                                    fullWidth: true,
                                },
                            }}
                        />

                        <TimePicker
                            label="Thời gian"
                            value={formValues.time}
                            onChange={(value) => handleChange("time", value)}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    required: true,
                                    fullWidth: true,
                                },
                            }}
                        />

                    </Stack>
                </LocalizationProvider>
                <TextField
                    label="Ghi chú"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={formValues.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className='modal-make-appointment-cancel'>Hủy</Button>
                <Button onClick={handleSubmit} className='modal-make-appointment-confirm'>
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAppointment;