// validationSchema.js
import * as yup from 'yup';

export const alertSubscriptionSchema = yup.object().shape({
    selectedCategory: yup.string().required('Vui lòng chọn danh mục bất động sản'),

    transactionType: yup
        .string()
        .when('selectedCategory', {
            is: (val) => val !== 'phòng trọ',
            then: (schema) => schema.required('Vui lòng chọn loại giao dịch'),
            otherwise: (schema) => schema.notRequired(),
        }),

    selectedProvince: yup.string().required('Vui lòng chọn tỉnh/thành phố'),
    selectedDistrict: yup.string().required('Vui lòng chọn quận/huyện'),

    propertyCategory: yup
        .string()
        .when('selectedCategory', {
            is: (val) =>
                ['Nhà ở', 'Căn hộ/chung cư', 'Đất', 'Văn phòng, mặt bằng kinh doanh'].includes(val),
            then: (schema) => schema.required('Vui lòng chọn loại hình'),
        }),

    bedroomCount: yup
        .string()
        .when('selectedCategory', {
            is: (val) => !['Đất', 'Văn phòng, mặt bằng kinh doanh'].includes(val),
            then: (schema) => schema.required('Vui lòng chọn số phòng ngủ'),
        }),

    floorCount: yup
        .number()
        .typeError('Tổng số tầng phải là số')
        .when('selectedCategory', {
            is: (val) => val === 'Nhà ở',
            then: (schema) => schema.required('Vui lòng nhập số tầng').min(1),
        }),

    areaRange: yup.object().shape({
        min: yup.number().typeError('Diện tích từ phải là số').required('Bắt buộc'),
        max: yup
            .number()
            .typeError('Diện tích đến phải là số')
            .required('Bắt buộc')
            .moreThan(yup.ref('min'), 'Diện tích đến phải lớn hơn diện tích từ'),
    }),

    priceRange: yup.object().shape({
        min: yup.number().typeError('Giá từ phải là số').required('Bắt buộc'),
        max: yup
            .number()
            .typeError('Giá đến phải là số')
            .required('Bắt buộc')
            .moreThan(yup.ref('min'), 'Giá đến phải lớn hơn giá từ'),
    }),

    legalContract: yup
        .string()
        .when(['selectedCategory', 'transactionType'], {
            is: (cat, trans) =>
                cat !== 'phòng trọ' &&
                !(cat === 'Văn phòng, mặt bằng kinh doanh' && trans === 'Cho thuê'),
            then: (schema) => schema.required('Vui lòng chọn giấy tờ pháp lý'),
        }),

    notifyMethod: yup.string().required('Vui lòng chọn phương thức thông báo'),
});