import React, { useState } from 'react';
import { Heart, MessageSquare, X } from 'lucide-react';
import CommentSection from './CommentSection';
import API from '../services/api';

const PostCard = ({ post, currentUser }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null); // Image popup state

  const isLiked = currentUser ? likes.includes(currentUser.name) : false;

  // Generate color from username for consistent avatar color
  const getAvatarColor = (username) => {
    const colors = ['#1d9bf0','#7856ff','#ff6b6b','#00ba7c','#ff7043','#f7b731','#45aaf2'];
    if (!username) return colors[0];
    const idx = username.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : username[0].toUpperCase();
  };

  const getHandle = (username) =>
    username ? '@' + username.toLowerCase().replace(/\s+/g, '') : '';

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'now';
    const diff = (new Date() - new Date(dateString)) / 1000;
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Is this a promotion post?
  const isPromotion = post.text && post.text.startsWith('📢 [Promotion]');
  const displayText = isPromotion ? post.text.replace('📢 [Promotion]\n', '') : post.text;

  const handleLikeToggle = async () => {
    if (!currentUser || likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    const hasLiked = likes.includes(currentUser.name);
    setLikes(hasLiked ? likes.filter(n => n !== currentUser.name) : [...likes, currentUser.name]);
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
    } catch {
      // Revert on error
      setLikes(likes);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <>
      {/* ── Post Card ── */}
      <article className="post-card">
        {/* Promotion ribbon */}
        {isPromotion && (
          <div className="promo-ribbon">📢 Promoted</div>
        )}

        {/* Header */}
        <div className="pc-header">
          <div
            className="pc-avatar"
            style={{ background: getAvatarColor(post.username) }}
          >
            {getInitials(post.username)}
          </div>
          <div className="pc-user-info">
            <span className="pc-name">{post.username}</span>
            <span className="pc-handle">{getHandle(post.username)}</span>
            <span className="pc-dot">·</span>
            <span className="pc-time">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>

        {/* Text Content */}
        {displayText && (
          <p className="pc-text">{displayText}</p>
        )}

        {/* Image — click to open lightbox */}
        {post.imageUrl && (
          <div
            className="pc-img-wrapper"
            onClick={() => setLightboxImg(post.imageUrl)}
            role="button"
            tabIndex={0}
            title="Click to expand"
            onKeyDown={e => e.key === 'Enter' && setLightboxImg(post.imageUrl)}
          >
            <img
              src={post.imageUrl}
              alt="Post"
              className="pc-img"
              loading="lazy"
            />
            <div className="pc-img-overlay">
              <span>View photo</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="pc-actions">
          <button
            className={`pc-action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            aria-label="Like"
          >
            <Heart size={17} fill={isLiked ? '#f91880' : 'none'} color={isLiked ? '#f91880' : 'currentColor'} />
            <span>{likes.length > 0 ? likes.length : ''}</span>
          </button>

          <button
            className="pc-action-btn comment-btn"
            onClick={() => setShowComments(v => !v)}
            aria-label="Comment"
          >
            <MessageSquare size={17} />
            <span>{comments.length > 0 ? comments.length : ''}</span>
          </button>
        </div>

        {/* Inline Comments */}
        {showComments && (
          <div className="pc-comments-wrapper">
            <CommentSection
              postId={post._id}
              initialComments={comments}
              onCommentAdded={setComments}
            />
          </div>
        )}
      </article>

      {/* ── Lightbox Modal ── */}
      {lightboxImg && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-label="Image preview"
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxImg(null)}
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxImg}
            alt="Full view"
            className="lightbox-img"
            onClick={e => e.stopPropagation()} // Don't close when clicking image itself
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
