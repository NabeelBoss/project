import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [useremail, setEmail] = useState('');
  const [userpassword, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [error, setError] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch roles for the user
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/userrole');
        setUserRoles(response.data);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };

    // Fetch roles for staff
    const fetchStaffRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/staffrole');
        setStaffRoles(response.data);
      } catch (error) {
        console.error('Error fetching staff roles:', error);
      }
    };

    fetchUserRoles();
    fetchStaffRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      setError('Name is required.');
      return;
    }

    if (!useremail) {
      setError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(useremail)) {
      setError('Invalid email format.');
      return;
    }

    if (!userpassword) {
      setError('Password is required.');
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required.');
      return;
    }
    if (!/^\d{11}$/.test(phoneNumber)) {
      setError('Phone number must be 11 digits.');
      return;
    }
    
    if (!userImage) {
      setError('Image is required.');
      return;
    }

    if (!userRole) {
      setError('User role is required.');
      return;
    }

    if (userRole === 'staff' && !staffRole) {
      setError('Staffrole is required when user role is Staff.');
      return;
    }

    setError('');  

    const selectedUserRoleId = userRoles.find(role => role.userrole === userRole)?._id;
    const selectedStaffRoleId = staffRole ? staffRoles.find(role => role.staffrole === staffRole)?._id : null;

    if (!selectedUserRoleId) {
      setError('Selected user role is invalid.');
      return;
    }

    setIsSubmitting(true);

    const data = {
      Username: username,
      useremail: useremail,
      userpassword: userpassword,
      phoneNumber: phoneNumber,
      userRole: selectedUserRoleId,
      staffRole: selectedStaffRoleId,
    };

    if (userImage) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        data.userImage = reader.result;

        try {
          const response = await axios.post('http://localhost:5000/user', data, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          localStorage.setItem('useremail', useremail);
          navigate('/emailotpverification');
        } catch (err) {
          setError(err.response ? err.response.data.error : 'An error occurred. Please try again later.');
        }
      };
      reader.readAsDataURL(userImage);
    } else {
      try {
        const response = await axios.post('http://localhost:5000/user', data, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        alert('User created successfully!');
        navigate('/emailotpverification');
      } catch (err) {
        setError(err.response ? err.response.data.error : 'An error occurred. Please try again later.');
      } finally {
        // Reset the submitting state (both in success and failure cases)
        setIsSubmitting(false);
      }
    }
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
            alt="Signup"
            className="page-header__shape"
          />
          <h2 className="page-header__title">Registration</h2>
          <ul className="solinom-breadcrumb list-unstyled">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <span>Signup</span>
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
                <h3 className="login-page__wrap__title">Signup</h3>
                <form onSubmit={handleSubmit} className="login-page__form">
                  <div className="login-page__form-input-box">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div className="login-page__form-input-box">
                    <input
                      type="email"
                      value={useremail}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="login-page__form-input-box">
                    <input
                      type="password"
                      value={userpassword}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>
                  <div className="login-page__form-input-box">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="login-page__form-input-box">
                    <input
                      type="file"
                      onChange={(e) => setUserImage(e.target.files[0])}
                    />
                  </div>

                  <div className="login-page__form-input-box">
                    <select
                      className="login-page__select"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                    >
                      <option value="" disabled>Select Role</option>
                      {userRoles.map((role) => (
                        <option key={role.userroleid} value={role.userrole}>
                          {role.userrole}
                        </option>
                      ))}
                    </select>
                  </div>

                  {userRole === 'staff' && (
                    <div className="login-page__form-input-box">
                      <select
                        className="login-page__select"
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                      >
                        <option value="">Select Staff Role</option>
                        {staffRoles.map((role) => (
                          <option key={role.staffroleid} value={role.staffrole}>
                            {role.staffrole}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {error && <p style={{ color: 'red' }}>{error}</p>}

                  <div className="login-page__form-btn-box">
                    <button
                      type="submit"
                      className="solinom-btn solinom-btn--base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Please wait...' : 'Register'}
                    </button>
                  </div>
                </form>

                <div className="login-page__signup">
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="login-page__signup-link">
                      Login here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
