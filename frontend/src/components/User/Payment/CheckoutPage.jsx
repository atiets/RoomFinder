// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import {
//   Box,
//   Typography,
//   Divider,
//   Grid,
//   Button,
//   Card,
//   CardContent,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
// } from "@mui/material";
// import PaymentIcon from "@mui/icons-material/Payment";

// const CheckoutPage = () => {
//   const currentUser = useSelector((state) => state.auth.login.currentUser);
//   const token = currentUser?.accessToken;
//   const navigate = useNavigate();
//   const [params] = useSearchParams();
//   const title = params.get("title");
//   const duration = params.get("duration") || "90 ngày";
//   const price = Number(params.get("price")) || 0;
//   const features = params.get("features")?.split(",");
//   const plan = params.get("plan");

//   const removeVietnameseTones = (str) => {
//     return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
//   };
  
//   const generateOrderCode = () => {
//     const cleanTitle = removeVietnameseTones(title || "GOI")
//       .replace(/\s+/g, "")
//       .toUpperCase()
//       .slice(0, 4);
//     const timestamp = Date.now().toString().slice(-5);
//     return `${cleanTitle}${timestamp}`;
//   };  

//   const handleMoMoPayment = async () => {
//     const orderCode = generateOrderCode();
//     const amount = price;
//     const planId = plan;

//     try {
//       const res = await fetch("http://localhost:8000/v1/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ orderCode, amount, planId }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         navigate("/momo-payment", {
//           state: { orderCode, amount, planId },
//         });
//       } else {
//         console.error(data);
//         alert("Tạo đơn hàng thất bại!");
//       }
//     } catch (err) {
//       console.error("Lỗi kết nối đến server:", err);
//       alert("Không thể kết nối đến server.");
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 1200, mx: "auto", mt: 8, px: 3 }}>
//       {/* Trang tiêu đề */}
//       <Typography
//         variant="h4"
//         fontWeight={700}
//         align="center"
//         gutterBottom
//         sx={{ color: "#2e7d32", mb: 4 }}
//       >
//         🧾 Trang Thanh Toán
//       </Typography>

//       <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
//         Vui lòng kiểm tra kỹ thông tin trước khi tiến hành thanh toán.
//       </Typography>

//       <Grid container spacing={4}>
//         {/* Bên trái - Thông tin gói */}
//         <Grid item xs={12} md={7}>
//           <Card elevation={3} sx={{ height: 'fit-content' }}>
//             <CardContent>
//               <Typography 
//                 variant="h6" 
//                 fontWeight={600} 
//                 gutterBottom 
//                 sx={{ color: "#2e7d32", mb: 3 }}
//               >
//                 📋 Thông tin gói dịch vụ
//               </Typography>

//               <Grid container spacing={3} alignItems="center">
//                 {/* Hình ảnh gói */}
//                 <Grid item xs={12} sm={5}>
//                   <Box
//                     component="img"
//                     src="https://i.pinimg.com/736x/10/e3/1e/10e31ee7d4137394ff07d67d9477d2ef.jpg"
//                     alt="Gói dịch vụ"
//                     sx={{ 
//                       width: "100%", 
//                       borderRadius: 2,
//                       maxHeight: 200,
//                       objectFit: 'cover'
//                     }}
//                   />
//                 </Grid>

//                 {/* Thông tin gói */}
//                 <Grid item xs={12} sm={7}>
//                   <Typography variant="h6" fontWeight={600} gutterBottom>
//                     {title || "Gói Chuyên Nghiệp - Tin thường"}
//                   </Typography>
                  
//                   <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                     <Typography color="text.secondary">
//                       Thời gian: {duration}
//                     </Typography>
//                     <Typography fontWeight={700} color="primary" variant="h6">
//                       {price.toLocaleString()} đ
//                     </Typography>
//                   </Box>

//                   {features?.length > 0 && (
//                     <Box>
//                       <Typography fontWeight={500} gutterBottom>
//                         Tính năng bao gồm:
//                       </Typography>
//                       <Box component="ul" sx={{ pl: 2, m: 0 }}>
//                         {features.map((feature, index) => (
//                           <Typography 
//                             component="li" 
//                             key={index} 
//                             variant="body2" 
//                             sx={{ mb: 0.5 }}
//                           >
//                             {feature}
//                           </Typography>
//                         ))}
//                       </Box>
//                     </Box>
//                   )}
//                 </Grid>
//               </Grid>

//               {/* Tổng kết */}
//               <Box
//                 sx={{
//                   backgroundColor: "#f3f4f6",
//                   borderRadius: 2,
//                   p: 3,
//                   mt: 3,
//                 }}
//               >
//                 <Grid container spacing={2}>
//                   <Grid item xs={6}>
//                     <Typography variant="h6" fontWeight={600}>
//                       Tổng thanh toán:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} textAlign="right">
//                     <Typography variant="h6" fontWeight={700} color="error">
//                       {price.toLocaleString()} đ
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Bên phải - Phương thức thanh toán */}
//         <Grid item xs={12} md={5}>
//           <Card elevation={3} sx={{ position: 'sticky', top: 20 }}>
//             <CardContent>
//               <Typography 
//                 variant="h6" 
//                 fontWeight={600} 
//                 gutterBottom 
//                 sx={{ color: "#2e7d32", mb: 3 }}
//               >
//                 💳 Phương thức thanh toán
//               </Typography>

//               <RadioGroup defaultValue="momo">
//                 <FormControlLabel
//                   value="momo"
//                   control={<Radio sx={{ color: "#d82d8b" }} />}
//                   label={
//                     <Box 
//                       display="flex" 
//                       alignItems="center" 
//                       gap={2}
//                       sx={{ 
//                         p: 2, 
//                         border: '2px solid #f0f0f0',
//                         borderRadius: 2,
//                         width: '100%',
//                         '&:hover': {
//                           borderColor: '#d82d8b',
//                           backgroundColor: '#fef7f7'
//                         }
//                       }}
//                     >
//                       <img
//                         src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
//                         alt="MoMo"
//                         width={32}
//                         height={32}
//                       />
//                       <Box>
//                         <Typography fontWeight={600} fontSize={16}>
//                           Ví MoMo
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Thanh toán nhanh chóng và bảo mật
//                         </Typography>
//                       </Box>
//                     </Box>
//                   }
//                   sx={{ m: 0, width: '100%' }}
//                 />
//               </RadioGroup>

//               <Divider sx={{ my: 3 }} />

//               {/* Tóm tắt đơn hàng */}
//               <Box sx={{ mb: 3 }}>
//                 <Typography variant="subtitle2" fontWeight={600} gutterBottom>
//                   Tóm tắt đơn hàng
//                 </Typography>
//                 <Box display="flex" justifyContent="space-between" mb={1}>
//                   <Typography variant="body2" color="text.secondary">
//                     Gói dịch vụ
//                   </Typography>
//                   <Typography variant="body2">
//                     {price.toLocaleString()} đ
//                   </Typography>
//                 </Box>
//                 <Divider sx={{ my: 1 }} />
//                 <Box display="flex" justifyContent="space-between">
//                   <Typography fontWeight={600}>
//                     Tổng cộng
//                   </Typography>
//                   <Typography fontWeight={700} color="error">
//                     {price.toLocaleString()} đ
//                   </Typography>
//                 </Box>
//               </Box>

//               <Button
//                 variant="contained"
//                 color="success"
//                 size="large"
//                 fullWidth
//                 sx={{ 
//                   py: 1.5,
//                   fontWeight: 700,
//                   fontSize: 16,
//                   borderRadius: 2
//                 }}
//                 startIcon={<PaymentIcon />}
//                 onClick={handleMoMoPayment}
//               >
//                 THANH TOÁN NGAY
//               </Button>

//               <Typography 
//                 variant="caption" 
//                 color="text.secondary" 
//                 align="center" 
//                 sx={{ display: 'block', mt: 2 }}
//               >
//                 Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng của chúng tôi
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default CheckoutPage;