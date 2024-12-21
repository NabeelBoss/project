import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if both fields are filled
    if (!useremail || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {


      const data = {
        useremail: useremail,
        userpassword: password,
      };

      const response = await axios.post('http://localhost:5000/user/loginuser', data);

      if (response.status === 200) {
        console.log('Logged in successfully:', response.data);
        localStorage.setItem('authToken', response.data.data);
        navigate('/');
      }
    } catch (err) {
      console.error('Error during login:', err.response || err.message);
      setError(err.response?.data?.error || 'An error occurred during login.');
    } finally {
      setIsSubmitting(false);
  }

    // Clear form fields
    setUseremail('');
    setPassword('');
  };

  return (
    <>
      <section className="page-header">
        <div
          className="page-header__bg"
          style={{
            backgroundImage: "url('assets/images/backgrounds/header-bg.jpg')",
          }}
        ></div>
        <div className="container">
          <img
            src="assets/images/shapes/page-header-s-1.png"
            alt="Login"
            className="page-header__shape"
          />
          <h2 className="page-header__title">Login</h2>
          <ul className="solinom-breadcrumb list-unstyled">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <span>Login</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="login-page">
        <div className="container">
          <div className="login-page__inner">
            <div
              className="col-lg-12 wow fadeInUp animated text-center"
              data-wow-delay="300ms"
            >
              <div className="login-page__wrap">
                <h3 className="login-page__wrap__title">Login</h3>
                <form onSubmit={handleSubmit} className="login-page__form">
                  <div className="login-page__form-input-box">
                    <input
                      type="email"
                      placeholder="User Name or  Email Address*"
                      value={useremail}
                      onChange={(e) => setUseremail(e.target.value)}
                    />
                  </div>
                  <div className="login-page__form-input-box">
                    <input
                      type="password"
                      placeholder="Password*"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="error">{error}</p>}
                  <div className="login-page__checked-box">
                    <div className="login-page__signup">
                      <p>
                        Don’t have an account?{" "}
                        <Link to="/signup" className="login-page__signup-link">
                          Register here
                        </Link>
                      </p>
                    </div>
                    <div className="login-page__form-forgot-password">
                      <Link
                        to="/forgetpass"
                        className="login-page__form-forgot-password__item"
                      >
                        Forget Password?
                      </Link>
                    </div>
                  </div>

                  <div className="login-page__form-btn-box">
                    <button
                      type="submit"
                      className="solinom-btn solinom-btn--base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Please wait...' : 'Login'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const styles = {

  button: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    width: '100%',
    marginTop: '20px',
  },

};

export default Login;
