import React, { useState } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('All fields are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      // Save credentials
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to feed/home
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container d-flex align-items-center justify-content-center px-3">
      <Card className="auth-card border-0 shadow-lg text-light">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="brand-title mb-2">Social</h1>
            <p className="text-white-50">Create an account to join the feed</p>
          </div>

          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Name Input */}
            <Form.Group className="mb-3" controlId="name">
              <Form.Label className="small text-white-50">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
                required
                className="auth-input"
              />
            </Form.Group>

            {/* Email Input */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="small text-white-50">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                disabled={loading}
                required
                className="auth-input"
              />
            </Form.Group>

            {/* Password Input */}
            <Form.Group className="mb-3" controlId="password">
              <Form.Label className="small text-white-50">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                disabled={loading}
                required
                className="auth-input"
              />
            </Form.Group>

            {/* Confirm Password Input */}
            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label className="small text-white-50">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                disabled={loading}
                required
                className="auth-input"
              />
            </Form.Group>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-100 py-2 btn-submit fw-semibold"
            >
              {loading ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Spinner animation="border" size="sm" />
                  <span>Registering...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <span className="text-white-50 small">Already have an account? </span>
            <Link to="/login" className="auth-link small fw-semibold">
              Log In
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Signup;
