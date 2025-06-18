import { useState, useEffect } from "react";
import { Checkbox, FormControlLabel, Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useUsageManager } from "../../../../../hooks/useUsageManager";
import RoomPostPreviewModal from "../../RoomPostPreviewModal/RoomPostPreviewModal";
import axios from "axios";
import "./index.css";

const FooterAddPost = ({
  onSubmit,
  type,
  editPost,
  mediaData,
  contentData,
  isVip,
  onVipChange,
  onPostSuccess, // ⭐ Thêm prop này để parent component báo khi đăng tin thành công
}) => {
  const [openPreview, setOpenPreview] = useState(false);
  const [localPostQuota, setLocalPostQuota] = useState(null); // ⭐ State local cho gói Free
  const { currentUsage, loading } = useUsageManager();
  const currentUser = useSelector((state) => state.auth.login.currentUser);

  console.log("Current User:", currentUser);
  console.log("Current Usage:", currentUsage);
  console.log("Local Post Quota:", localPostQuota);

  // ⭐ Fetch user quota từ API (chỉ cho gói Free)
  const fetchUserQuota = async () => {
    if (!currentUser?.accessToken) return;

    const planType = getPlanType();
    if (planType !== "free") return;

    try {
      console.log("🔄 Fetching user quota for Free plan...");

      // ⭐ Đảm bảo path đúng
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL_API || "http://localhost:8000"}/v1/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        const newQuota = response.data.data.postQuota;
        setLocalPostQuota(newQuota);
        console.log("✅ User quota fetched:", newQuota);
      }
    } catch (error) {
      console.error("Error fetching user quota:", error);

      // ⭐ Fallback nếu API lỗi
      console.log("📋 Using fallback quota from currentUser");
      setLocalPostQuota(currentUser?.postQuota || 3);
    }
  };

  // ⭐ Effect để fetch quota lần đầu (chỉ cho gói Free)
  useEffect(() => {
    const planType = getPlanType();
    if (planType === "free") {
      fetchUserQuota();
    }
  }, [currentUser?.accessToken, currentUsage?.planType]);

  // ⭐ Effect để listen khi đăng tin thành công
  useEffect(() => {
    if (onPostSuccess) {
      // Override onPostSuccess để fetch quota mới
      const originalOnSubmit = onSubmit;

      const wrappedOnSubmit = async (...args) => {
        try {
          await originalOnSubmit(...args);

          // Sau khi đăng tin thành công, fetch quota mới cho gói Free
          const planType = getPlanType();
          if (planType === "free") {
            setTimeout(() => {
              fetchUserQuota();
            }, 1000); // Delay 1s để đảm bảo backend đã update
          }
        } catch (error) {
          console.error("Submit error:", error);
          throw error;
        }
      };
    }
  }, [onSubmit, onPostSuccess]);

  const handlePreview = () => {
    setOpenPreview(true);
  };

  const handleClose = () => {
    setOpenPreview(false);
  };

  const handleVipToggle = async (event) => {
    const newIsVip = event.target.checked;
    const success = await onVipChange(newIsVip);
    if (!success && newIsVip) {
      event.target.checked = false;
    }
  };

  // ⭐ Wrapper cho onSubmit để fetch quota sau khi thành công
  const handleSubmit = async () => {
    try {
      await onSubmit(); // Gọi onSubmit gốc

      // Sau khi thành công, fetch quota mới cho gói Free
      const planType = getPlanType();
      if (planType === "free") {
        setTimeout(() => {
          fetchUserQuota();
        }, 1500); // Delay để đảm bảo backend đã update
      }
    } catch (error) {
      console.error("Submit error:", error);
      throw error; // Rethrow để parent component xử lý
    }
  };

  const formatPostData = () => {
    if (type === "edit" && editPost) {
      return {
        _id: editPost._id,
        title: editPost.title || "",
        price: Number(editPost.price) || 0,
        area: Number(editPost.area) || 0,
        typeArea: editPost.typeArea || "",
        images: editPost.images || [],
        address: {
          district: editPost.district || editPost.address?.district || "",
          province: editPost.province || editPost.address?.province || "",
        },
      };
    } else {
      const imagePreviews = Array.isArray(mediaData?.images)
        ? mediaData.images
            .filter((img) => img.preview)
            .map((img) => img.preview)
        : [];

      return {
        _id: "preview-temp-id",
        title: contentData?.title || "",
        price: Number(contentData?.price) || 0,
        area: Number(contentData?.area) || 0,
        typeArea: contentData?.typeArea || "",
        images: imagePreviews,
        address: {
          district: contentData?.district || "",
          province: contentData?.province || "",
        },
      };
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getPlanType = () => {
    if (!currentUsage) return "free";
    return currentUsage.planType || "free";
  };

  const canPost = () => {
    if (!currentUser) return false;

    const planType = getPlanType();

    if (planType === "free") {
      // ⭐ Ưu tiên localPostQuota (data mới từ API), fallback currentUser.postQuota
      const freeQuota = localPostQuota ?? currentUser?.postQuota ?? 0;
      return freeQuota > 0;
    } else {
      // Gói Pro/Plus: check từ currentUsage
      const quota = currentUsage?.currentUsage?.postsCreated || 0;
      return quota > 0;
    }
  };

  const canPostVip = () => {
    if (!currentUser) return false;

    const planType = getPlanType();

    if (planType === "free") {
      return false; // Gói Free không được VIP
    } else {
      const vipQuota = currentUsage?.currentUsage?.vipPostsUsed || 0;
      return vipQuota > 0;
    }
  };

  const renderPostTypeInfo = () => {
    if (loading) {
      return <span>Đang tải...</span>;
    }

    if (!currentUser) {
      return <span>Vui lòng đăng nhập để đăng tin</span>;
    }

    const planType = getPlanType();
    console.log("Plan Type:", planType);

    // ===== GÓI PRO =====
    if (planType === "pro") {
      const normalQuota = currentUsage?.currentUsage?.postsCreated || 0;
      const vipQuota = currentUsage?.currentUsage?.vipPostsUsed || 0;
      const hasVipQuota = vipQuota > 0;

      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isVip}
                onChange={handleVipToggle}
                disabled={!hasVipQuota}
                sx={{
                  color: "#ff9800",
                  "&.Mui-checked": {
                    color: "#ff9800",
                  },
                }}
              />
            }
            label=""
            sx={{ margin: 0 }}
          />

          <Box>
            {isVip ? (
              <span>
                Đã chọn{" "}
                <strong style={{ color: "#ff9800" }}>🌟 Đăng tin VIP</strong>
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.9em",
                    marginLeft: "8px",
                  }}
                >
                  (Còn lại: {vipQuota} tin)
                </span>
              </span>
            ) : (
              <span>
                Đã chọn <strong>📄 Đăng tin thường</strong>
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.9em",
                    marginLeft: "8px",
                  }}
                >
                  (Còn lại: {normalQuota} tin)
                </span>
              </span>
            )}
          </Box>
        </Box>
      );
    }

    // ===== GÓI PLUS =====
    else if (planType === "plus") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isVip}
                onChange={handleVipToggle}
                sx={{
                  color: "#ff9800",
                  "&.Mui-checked": {
                    color: "#ff9800",
                  },
                }}
              />
            }
            label=""
            sx={{ margin: 0 }}
          />

          <Box>
            {isVip ? (
              <span>
                Đã chọn{" "}
                <strong style={{ color: "#ff9800" }}>🌟 Đăng tin VIP</strong>
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.9em",
                    marginLeft: "8px",
                  }}
                >
                  (Không giới hạn)
                </span>
              </span>
            ) : (
              <span>
                Đã chọn <strong>📄 Đăng tin thường</strong>
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.9em",
                    marginLeft: "8px",
                  }}
                >
                  (Không giới hạn)
                </span>
              </span>
            )}
          </Box>
        </Box>
      );
    }

    // ===== GÓI FREE =====
    else {
      // ⭐ Ưu tiên localPostQuota (data mới từ API), fallback các giá trị khác
      const freeQuota =
        localPostQuota ??
        currentUser?.postQuota ??
        currentUsage?.currentUsage?.postsCreated ??
        3;
      const canPostFree = freeQuota > 0;

      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={false}
                disabled={true} // Gói Free không được đăng tin VIP
                sx={{
                  color: "#ccc",
                  "&.Mui-disabled": {
                    color: "#ccc",
                  },
                }}
              />
            }
            label=""
            sx={{ margin: 0 }}
          />

          <Box>
            <span style={{ color: canPostFree ? "inherit" : "#f44336" }}>
              Đã chọn <strong>📄 Đăng tin thường miễn phí</strong>
              <span
                style={{
                  color: canPostFree ? "#666" : "#f44336",
                  fontSize: "0.9em",
                  marginLeft: "8px",
                  fontWeight: canPostFree ? "normal" : "bold",
                }}
              >
                (Còn lại: {freeQuota} tin)
                {localPostQuota !== null &&
                  localPostQuota !== currentUser?.postQuota && (
                    <span style={{ color: "#4caf50", marginLeft: "4px" }}>
                      📡
                    </span>
                  )}
              </span>
            </span>

            {!canPostFree && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "#f44336",
                  fontWeight: "bold",
                  marginTop: "4px",
                }}
              >
                ⚠️ Bạn đã hết quota đăng tin miễn phí!
              </Typography>
            )}

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "#757575",
                marginTop: "4px",
              }}
            >
              💡 Nâng cấp lên gói Pro/Plus để đăng nhiều tin hơn
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  return (
    <>
      <div className="footer-add-post">
        <div className="footer-left">{renderPostTypeInfo()}</div>
        <div className="footer-right">
          <button className="btn-preview" onClick={handlePreview}>
            Xem trước
          </button>
          <button
            className={`btn-submit ${!canPost() ? "disabled" : ""}`}
            onClick={handleSubmit} // ⭐ Sử dụng wrapper function
            disabled={!canPost()}
          >
            {type === "edit" ? "Chỉnh sửa tin" : "Đăng tin"}
          </button>
        </div>
      </div>
      <RoomPostPreviewModal
        open={openPreview}
        onClose={handleClose}
        post={formatPostData()}
        onToggleFavorite={() => {}}
        isFavorite={false}
        onTitleClick={() => {}}
      />
    </>
  );
};

export default FooterAddPost;
