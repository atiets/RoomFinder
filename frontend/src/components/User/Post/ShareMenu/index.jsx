import ShareIcon from "@mui/icons-material/Share";
import { Button, Popover } from "@mui/material";
import { useState } from "react";
import {
    FacebookIcon,
    FacebookMessengerIcon,
    FacebookMessengerShareButton,
    FacebookShareButton,
    TwitterIcon,
    TwitterShareButton,
} from "react-share";
import Zalo from "../../../../assets/images/zalo-logo.png";

const ShareMenu = ({ url, title }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const APP_ID = process.env.YOUR_FACEBOOK_APP_ID

    const handleClick = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? "share-popover" : undefined;

    return (
        <div className="share-container">
            <Button onClick={handleClick}>
                <ShareIcon />
            </Button>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <div style={{ padding: 12, display: "flex", gap: 12 }}>
                    <FacebookShareButton url={url} quote={title}>
                        <FacebookIcon size={40} round />
                    </FacebookShareButton>

                    <FacebookMessengerShareButton url={url} appId={APP_ID}>
                        <FacebookMessengerIcon size={40} round />
                    </FacebookMessengerShareButton>

                    <TwitterShareButton url={url} title={title}>
                        <TwitterIcon size={40} round />
                    </TwitterShareButton>
                    <a
                        href={`https://zalo.me/share?url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src={Zalo}
                            alt="Zalo"
                            style={{ width: 40, height: 40, borderRadius: "50%" }}
                        />
                    </a>
                </div>
            </Popover>
        </div>
    );
};

export default ShareMenu;
