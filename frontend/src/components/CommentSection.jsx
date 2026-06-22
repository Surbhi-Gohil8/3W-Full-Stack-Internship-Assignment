import React, { useState } from 'react';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Send } from 'lucide-react';
import API from '../services/api';

const CommentSection = ({ postId, initialComments = [], onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getInitials = (username) => {
    if (!username) return '?';
    return username[0].toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await API.post(`/posts/${postId}/comment`, { text: commentText.trim() });
      
      // Clear input on success
      setCommentText('');
      
      // Notify parent component about new comments array
      if (onCommentAdded) {
        onCommentAdded(response.data.comments);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError(err.response?.data?.message || 'Failed to submit comment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section px-3 pb-3 border-top border-secondary-subtle pt-3">
      {/* Comments List */}
      <div className="comments-list max-h-200 overflow-y-auto mb-3 pr-1">
        {initialComments.length === 0 ? (
          <p className="text-muted small text-center my-2">No comments yet. Start the conversation!</p>
        ) : (
          initialComments.map((comment, index) => (
            <div key={comment._id || index} className="comment-item d-flex align-items-start gap-2 mb-2">
              {/* Commenter Initials Avatar */}
              <div className="comment-avatar d-flex align-items-center justify-content-center">
                {getInitials(comment.username)}
              </div>
              
              {/* Comment Content */}
              <div className="comment-bubble p-2 flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="comment-author fw-bold">{comment.username}</span>
                  <span className="comment-time text-white-50">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>
                </div>
                <p className="comment-text m-0">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <Form onSubmit={handleSubmit} className="mt-2">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={submitting}
            className="comment-input"
            required
          />
          <Button 
            type="submit" 
            variant="primary" 
            disabled={submitting || !commentText.trim()}
            className="comment-submit-btn d-flex align-items-center justify-content-center"
          >
            {submitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </InputGroup>
        {error && <div className="text-danger small mt-1">{error}</div>}
      </Form>
    </div>
  );
};

export default CommentSection;
