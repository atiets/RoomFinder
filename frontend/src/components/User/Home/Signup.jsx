import React from 'react';
import { useNavigate } from "react-router-dom";
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();

    return (
        <section className="footer-signup-section" data-section="footerSignupSection">
            <div className="cta-box has-text-centered has-shadow-large">
            <h2 className="has-margin-bottom-md">
                <p>📢 Đăng bài cho thuê trọ miễn phí! 🏠🆓</p>
            </h2>
            <div className="animated-arrow-container">
                <div className="arrow-line"></div>
                <div className="animated-arrow"></div>
            </div>
                <div className="signups-container">
                    <div className='signups-button'>
                        <button 
                        type="button" 
                        className="button button-signup" 
                        title="Enable Modal" 
                        aria-label="Đăng ký"
                        onClick={() => navigate('/register')}
                        >
                        Đăng ký ngay
                        </button>
                    </div>
                    <div className="form-trigger align-undefined field-row">
                        <form action="#" noValidate data-section="signupForm">
                            <div className="columns-input">
                                <div className="colums-input-name">
                                    <div className="control">
                                        <input
                                            name="name"
                                            id="fullNamesignupsFooter"
                                            title="name"
                                            aria-placeholder="Vui lòng nhập tên đăng nhập"
                                            type="text"
                                            placeholder="Tên đăng nhập"
                                            className="input input-light name is-medium"
                                        />
                                        <span className="icon is-small is-left inputIcons is-hidden">
                                            <i className="wiw-icon wiw-user" aria-hidden="true"></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="colums-input-password">
                                    <div className="control is-expanded">
                                        <input
                                            name="password"
                                            id="passwordsignups"
                                            type="password"
                                            title="Mât khẩu"
                                            aria-placeholder="Vui lòng nhập mật khẩu"
                                            placeholder="Mật khẩu"
                                            className="input input-light password is-medium"
                                        />
                                        <span className="icon is-small is-left inputIcons is-hidden">
                                            <i className="wiw-icon wiw-email" aria-hidden="true"></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="column-button">
                                    <div className="control">
                                        <div className="field">
                                            <button
                                                type="submit"
                                                className="button button-submit false"
                                                title="Enable Modal"
                                                aria-label="Đăng nhập"
                                            >
                                                Đăng nhập
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="or-separator"><span>OR</span></div>
                    <button type="button" className="button-google-sign-in">
                        <img src="https://marketing-assets.wheniwork-production.com/2023/06/22132659/google-g-icon.svg" role="presentation" alt="Google Icon" />
                        Đăng nhập miễn phí với Google
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Signup;