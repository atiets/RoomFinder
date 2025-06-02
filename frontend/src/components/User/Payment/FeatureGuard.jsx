import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { checkFeatureUsage } from '../redux/subscriptionService';
import { useSelector } from 'react-redux';

const FeatureGuard = ({ 
    feature, 
    children, 
    fallbackComponent = null,
    showUpgradeDialog = true 
}) => {
    const [canUse, setCanUse] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [featureInfo, setFeatureInfo] = useState(null);

    const { accessToken } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        checkFeature();
    }, [feature, accessToken]);

    const checkFeature = async () => {
        if (!accessToken) {
            setCanUse(false);
            setLoading(false);
            return;
        }

        try {
            const response = await checkFeatureUsage(feature, accessToken);
            const { canUse: allowed, remainingUsage } = response.data.data;
            
            setCanUse(allowed);
            setFeatureInfo(response.data.data);
            
            if (!allowed && showUpgradeDialog) {
                setShowDialog(true);
            }
        } catch (error) {
            console.error('Error checking feature:', error);
            setCanUse(false);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = () => {
        setShowDialog(false);
        navigate('/subscription');
    };

    if (loading) {
        return <div>Đang kiểm tra quyền truy cập...</div>;
    }

    if (!canUse) {
        return (
            <>
                {fallbackComponent || (
                    <Alert severity="warning">
                        Bạn cần nâng cấp gói để sử dụng tính năng này.
                    </Alert>
                )}
                
                <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                    <DialogTitle>Nâng cấp gói dịch vụ</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Tính năng này không có sẵn trong gói hiện tại của bạn. 
                            Hãy nâng cấp để sử dụng đầy đủ các tính năng.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowDialog(false)}>
                            Để sau
                        </Button>
                        <Button onClick={handleUpgrade} variant="contained">
                            Nâng cấp ngay
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    return children;
};

export default FeatureGuard;
