import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailOtpVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem('useremail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            setError('Email not found. Please try again.');
        }
    }, []);

    const handleChange = (e, index) => {
        const value = e.target.value;

        if (/[^0-9]/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;

        if (value && index < 5) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }

        setOtp(newOtp);
    };

    const handleBackspace = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '') {
            if (index > 0) {
                document.getElementById(`otp-input-${index - 1}`).focus();
            }
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter a 6-digit OTP.');
            return;
        }
        setError('');  
        // Disable button and show message
        setIsSubmitting(true);

        try {
            // Send OTP and email to the server for verification
            const response = await axios.post('http://localhost:5000/verifyEmail', {
                useremail: email,
                otp: otpString,
            });

            // Handle success
            console.log(response.data.message);  // Optionally log the message from the server
            setOtp(['', '', '', '', '', '']);  // Reset OTP input fields
            navigate('/login');
        } catch (error) {
            // Handle error
            if (error.response && error.response.data) {
                setError(error.response.data.error);  // Set error from API response
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            // Reset the submitting state (both in success and failure cases)
            setIsSubmitting(false);
        }
    };

    return (
        <section className="login-page">
            <div className="container">
                <div className="login-page__inner">
                    <div className="col-lg-12 wow fadeInUp animated text-center" data-wow-delay="300ms">
                        <div className="login-page__wrap">
                            <h3 className="login-page__wrap__title">Signup Verification OTP</h3>
                            <form onSubmit={handleOtpSubmit} className="login-page__form">
                                <div className="login-page__form-input-box">
                                    <div className="otp-input-group">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-input-${index}`}
                                                type="text"
                                                value={digit}
                                                onChange={(e) => handleChange(e, index)}
                                                onKeyDown={(e) => handleBackspace(e, index)}
                                                className="otp-input"
                                                maxLength="1"
                                                placeholder="0"
                                            />
                                        ))}
                                    </div>
                                </div>
                                {error && <p className="error">{error}</p>}


                                <div className="login-page__form-btn-box">
                                    <button
                                        type="submit"
                                        className="solinom-btn solinom-btn--base"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Please wait...' : 'Verify OTP'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const styles = {
    loginPage: {
        backgroundColor: '#f9f9f9',
        padding: '50px 0',
    },
    loginPageInner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPageWrap: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
    },
    loginPageWrapTitle: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '20px',
    },
    otpInputGroup: {
        display: 'flex',
        justifyContent: 'space-between',  // This ensures that inputs are horizontally aligned
        marginBottom: '20px',
    },
    otpInput: {
        width: '50px',  // Set width to make the box smaller
        height: '50px',  // Adjust the height for consistency
        textAlign: 'center',
        fontSize: '18px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        margin: '0 5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'border 0.3s ease-in-out',
    },
    otpInputFocus: {
        borderColor: '#4CAF50',
    },
    error: {
        color: 'red',
        fontSize: '14px',
        marginTop: '10px',
    },
    loginPageFormBtnBox: {
        marginTop: '20px',
    },
    solinomBtn: {
        padding: '12px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
        width: '100%',
    },
    solinomBtnHover: {
        backgroundColor: '#45a049',
    },

};

export default EmailOtpVerification;
