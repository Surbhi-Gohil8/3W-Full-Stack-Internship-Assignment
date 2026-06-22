import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user is already logged in, redirect them immediately to Feed
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password
      });

      // Save token & user metadata in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to home/feed
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Invalid email or password.');
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
            <p className="text-white-50">Log in to view your feed and share posts</p>
          </div>

          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
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
            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="small text-white-50">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
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
                  <span>Logging in...</span>
                </div>
              ) : (
                'Log In'
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <span className="text-white-50 small">Don't have an account? </span>
            <Link to="/signup" className="auth-link small fw-semibold">
              Sign Up
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
