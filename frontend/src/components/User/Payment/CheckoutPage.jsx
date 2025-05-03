import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";

const CheckoutPage = () => {
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const title = params.get("title");
  const duration = params.get("duration") || "90 ngày";
  const price = Number(params.get("price")) || 0;
  const features = params.get("features")?.split(",");

  const taxRate = 0.08;
  const tax = price * taxRate;
  const total = price + tax;

  const generateOrderCode = () => {
    const cleanTitle = (title || "GOI")
      .replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 4);
    const timestamp = Date.now().toString().slice(-5); // 5 số cuối timestamp
    return `${cleanTitle}${timestamp}`;
  };

  const handleBankTransfer = async () => {
    const orderCode = generateOrderCode();
    const amount = total;

    try {
      const res = await fetch("http://localhost:8000/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderCode, amount }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/bank-transfer", {
          state: { orderCode, amount },
        });
      } else {
        console.error(data);
        alert("Tạo đơn hàng thất bại!");
      }
    } catch (err) {
      console.error("Lỗi kết nối đến server:", err);
      alert("Không thể kết nối đến server.");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 12, px: 2 }}>
      {/* Trang tiêu đề */}
      <Typography
        variant="h4"
        fontWeight={700}
        align="center"
        gutterBottom
        sx={{ color: "#2e7d32" }}
        fontSize={40}
      >
        🧾 Trang Thanh Toán
      </Typography>

      <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
        Vui lòng kiểm tra kỹ thông tin trước khi tiến hành thanh toán.
      </Typography>

      {/* Thông tin gói */}
      <Card sx={{ mb: 3, width: 800 }} elevation={3}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Hình ảnh gói tin */}
            <Grid item xs={4}>
              <Box
                component="img"
                src="https://i.pinimg.com/736x/10/e3/1e/10e31ee7d4137394ff07d67d9477d2ef.jpg"
                alt="Gói PRO"
                sx={{ width: "100%", maxWidth: 1000 }}
              />
            </Grid>

            {/* Thông tin gói tin */}
            <Grid item xs={8}>
              <Typography variant="subtitle1" fontWeight={700} fontSize={26}>
                {title || "Gói Chuyên Nghiệp - Tin thường"}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontStyle="italic" fontSize={17}>
                  Thời gian: {duration}
                </Typography>
                <Typography fontWeight={700} color="green" fontSize={17}>
                  {price.toLocaleString()} đ
                </Typography>
              </Box>

              {features?.length > 0 && (
                <Box mt={1}>
                  <Typography fontSize={17} fontWeight={500} gutterBottom>
                    Tính năng:
                  </Typography>
                  <ul
                    style={{
                      marginTop: 0,
                      paddingLeft: "1.2rem",
                      fontSize: 16,
                    }}
                  >
                    {features.map((feature, index) => (
                      <li key={index} style={{ fontSize: 13 }}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Tổng kết giá trị */}
          <Box
            sx={{
              backgroundColor: "#f9fbe7",
              border: "1px dashed #cddc39",
              borderRadius: 2,
              p: 2,
              mt: 2,
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography>Tạm tính:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography>{price.toLocaleString()} đ</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Thuế GTGT (8%):</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography>{tax.toLocaleString()} đ</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography fontWeight={700}>Tổng thanh toán:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight={700} color="error">
                  {total.toLocaleString()} đ
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Chọn phương thức thanh toán */}
      <Box>
        <Typography fontWeight={600} gutterBottom fontSize={26}>
          💳 Hình thức thanh toán
        </Typography>

        <RadioGroup defaultValue="bank">
          <FormControlLabel
            value="bank"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1} fontSize={19}>
                <img
                  src="https://img.icons8.com/color/48/000000/bank-building.png"
                  alt="Bank"
                  width={24}
                  height={24}
                />
                Chuyển khoản ngân hàng
              </Box>
            }
          />
          <FormControlLabel
            value="momo"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1} fontSize={19}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                  alt="MoMo"
                  width={24}
                  height={24}
                />
                Ví MoMo
              </Box>
            }
          />
          <FormControlLabel
            value="zalopay"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1} fontSize={19}>
                <img
                  src="https://static.chotot.com/storage/CT_WEB_UNI_PAYMENT_DASHBOARD/fd1a518195b786bf2b400842413324cd3059c5da/dist/cf5b4dd0bc1a29f352aad9aa476dffad.png"
                  alt="ZaloPay"
                  width={24}
                  height={24}
                />
                Ví ZaloPay
              </Box>
            }
          />
        </RadioGroup>

        <Button
          variant="contained"
          color="success"
          size="large"
          fullWidth
          sx={{ mt: 3, fontWeight: 700 }}
          startIcon={<PaymentIcon />}
          onClick={handleBankTransfer}
        >
          THANH TOÁN NGAY – {total.toLocaleString()} đ
        </Button>
      </Box>
    </Box>
  );
};

export default CheckoutPage;