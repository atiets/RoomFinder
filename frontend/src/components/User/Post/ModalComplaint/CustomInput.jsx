import './index.css';

const CustomInput = ({ placeholder, value, onChange }) => {
    return (
        <textarea
            rows={5}
            type="text"
            className="modal-complaint-custom-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default CustomInput;