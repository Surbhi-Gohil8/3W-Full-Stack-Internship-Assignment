import React, { useState } from 'react';
import { Heart, MessageSquare, X, Share2, MoreHorizontal } from 'lucide-react';
import CommentSection from './CommentSection';
import API from '../services/api';

const PostCard = ({ post, currentUser }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Simple mock follow system using localStorage
  const [isFollowing, setIsFollowing] = useState(() => {
    try {
      const followed = JSON.parse(localStorage.getItem('followed_users')) || [];
      return followed.includes(post.username);
    } catch {
      return false;
    }
  });

  const isLiked = currentUser ? likes.includes(currentUser.name) : false;

  const getAvatarColor = (username) => {
    const colors = [
      'linear-gradient(135deg, #1d9bf0, #0072b2)',
      'linear-gradient(135deg, #7856ff, #5027d5)',
      'linear-gradient(135deg, #ff6b6b, #ee5253)',
      'linear-gradient(135deg, #00ba7c, #008f5d)',
      'linear-gradient(135deg, #ff7043, #f4511e)',
      'linear-gradient(135deg, #f7b731, #f39c12)',
      'linear-gradient(135deg, #45aaf2, #2d98da)'
    ];
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

  const isPromotion = post.text && post.text.startsWith('📢 [Promotion]');
  const displayText = isPromotion ? post.text.replace('📢 [Promotion]\n', '') : post.text;

  const handleLikeToggle = async () => {
    if (!currentUser || likeLoading) return;
    setLikeLoading(true);

    const hasLiked = likes.includes(currentUser.name);
    setLikes(hasLiked ? likes.filter(n => n !== currentUser.name) : [...likes, currentUser.name]);
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
    } catch {
      setLikes(likes);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollowToggle = () => {
    try {
      const followed = JSON.parse(localStorage.getItem('followed_users')) || [];
      let updated;
      if (isFollowing) {
        updated = followed.filter((u) => u !== post.username);
      } else {
        updated = [...followed, post.username];
      }
      localStorage.setItem('followed_users', JSON.stringify(updated));
      setIsFollowing(!isFollowing);
    } catch (e) {
      setIsFollowing(!isFollowing);
    }
  };

  return (
    <>
      <article className="post-card">
        {isPromotion && (
          <div className="promo-ribbon">
            <span className="promo-dot"></span>
            Promoted
          </div>
        )}

        <div className="pc-layout">
          {/* Left Column: Avatar */}
          <div className="pc-left">
            <div
              className="pc-avatar"
              style={{ background: getAvatarColor(post.username) }}
            >
              {getInitials(post.username)}
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="pc-right">
            {/* Header row: User metadata & Follow action */}
            <div className="pc-header-row">
              <div className="pc-user-meta">
                <span className="pc-name">{post.username}</span>
                <span className="pc-handle">{getHandle(post.username)}</span>
                <span className="pc-dot">·</span>
                <span className="pc-time">{formatTimeAgo(post.createdAt)}</span>
              </div>
              
              {currentUser && currentUser.name !== post.username && (
                <button
                  type="button"
                  className={`pc-follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Post text */}
            {displayText && (
              <p className="pc-text">{displayText}</p>
            )}

            {/* Uploaded Post Image */}
            {post.imageUrl && (
              <div
                className="pc-img-wrapper"
                onClick={() => setLightboxImg(post.imageUrl)}
                role="button"
                tabIndex={0}
                title="Expand image"
                onKeyDown={(e) => e.key === 'Enter' && setLightboxImg(post.imageUrl)}
              >
                <img
                  src={post.imageUrl}
                  alt="Upload payload"
                  className="pc-img"
                  loading="lazy"
                />
                <div className="pc-img-overlay">
                  <span>Click to Expand</span>
                </div>
              </div>
            )}

            {/* Action Reactions Row */}
            <div className="pc-actions">
              <button
                className={`pc-action-btn like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                aria-label="Like post"
              >
                <Heart size={16} fill={isLiked ? '#f91880' : 'none'} color={isLiked ? '#f91880' : 'currentColor'} />
                <span>{likes.length}</span>
              </button>

              <button
                className={`pc-action-btn comment-btn ${showComments ? 'active' : ''}`}
                onClick={() => setShowComments((v) => !v)}
                aria-label="Toggle comments"
              >
                <MessageSquare size={16} fill={showComments ? 'rgba(29, 155, 240, 0.15)' : 'none'} />
                <span>{comments.length}</span>
              </button>

              <button
                className="pc-action-btn share-btn"
                aria-label="Share post"
                onClick={() => {
                  const postUrl = `${window.location.origin}/?post=${post._id}`;
                  navigator.clipboard.writeText(postUrl)
                    .then(() => alert('Post link copied to clipboard!'))
                    .catch(() => alert('Failed to copy post link.'));
                }}
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Comment Section Panel */}
            {showComments && (
              <div className="pc-comments-wrapper">
                <CommentSection
                  postId={post._id}
                  initialComments={comments}
                  onCommentAdded={setComments}
                />
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Lightbox pop up */}
      {lightboxImg && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxImg(null)}
            aria-label="Close image popup"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImg}
            alt="Expanded presentation"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
