import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Search, Sun, Moon, Image, Smile, AlignLeft, Megaphone, Send, ArrowUp, Bold, Italic, X } from 'lucide-react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';

// Common emoji list grouped by category
const EMOJI_LIST = [
  '😀','😂','😍','🥰','😎','🤔','😅','🙌','🔥','❤️',
  '👍','👏','🎉','✨','💯','🚀','🌟','😭','😤','🤣',
  '💪','🥳','😊','😋','😏','🤩','😴','🥺','😇','🤗',
  '👀','💡','🎯','🏆','💰','📸','🌈','⚡','💎','🎵',
  '🍕','☕','🌍','🤝','📢','🎮','📱','💻','🛡️','🎁',
];

// Text formatting helpers — wrap selected text in markdown-style markers
const applyFormat = (text, selStart, selEnd, prefix, suffix) => {
  const before = text.slice(0, selStart);
  const selected = text.slice(selStart, selEnd) || 'text';
  const after = text.slice(selEnd);
  return { newText: `${before}${prefix}${selected}${suffix}${after}`, cursorAt: selEnd + prefix.length + suffix.length };
};

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Post creation states
  const [postText, setPostText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toolbar panel states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [isPromotion, setIsPromotion] = useState(false); // Promotion tag toggle

  const fileInputRef = useRef(null);
  const feedTopRef = useRef(null);
  const textareaRef = useRef(null);

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const fetchPosts = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) setMoreLoading(true);
    else setLoading(true);
    setError('');

    try {
      const response = await API.get(`/posts?page=${pageNum}&limit=10`);
      const { posts: newPosts, hasMore: moreAvailable } = response.data;
      if (isLoadMore) setPosts((prev) => [...prev, ...newPosts]);
      else setPosts(newPosts);
      setPage(pageNum);
      setHasMore(moreAvailable);
    } catch (err) {
      setError('Could not retrieve posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!moreLoading && hasMore) fetchPosts(page + 1, true);
  };

  const triggerFileSelect = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Insert emoji at cursor position in textarea
  const insertEmoji = (emoji) => {
    const ta = textareaRef.current;
    if (!ta) { setPostText((t) => t + emoji); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = postText.slice(0, start) + emoji + postText.slice(end);
    setPostText(newText);
    // Restore cursor after emoji
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
    }, 0);
  };

  // Apply bold/italic formatting to selected text
  const applyTextFormat = (type) => {
    const ta = textareaRef.current;
    const start = ta ? ta.selectionStart : postText.length;
    const end = ta ? ta.selectionEnd : postText.length;
    let prefix = '', suffix = '';
    if (type === 'bold') { prefix = '**'; suffix = '**'; }
    else if (type === 'italic') { prefix = '_'; suffix = '_'; }
    const { newText } = applyFormat(postText, start, end, prefix, suffix);
    setPostText(newText);
    setTimeout(() => ta && ta.focus(), 0);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !imagePreview) {
      alert('Please write something or attach an image.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Prepend promotion label if toggled
      const finalText = isPromotion ? `📢 [Promotion]\n${postText.trim()}` : postText.trim();
      const response = await API.post('/posts', { text: finalText, imageUrl: imagePreview });
      setPosts((prev) => [response.data.post, ...prev]);
      setPostText('');
      setIsPromotion(false);
      setShowEmojiPicker(false);
      setShowFormatBar(false);
      removeImagePreview();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTop = () => feedTopRef.current?.scrollIntoView({ behavior: 'smooth' });

  const getFilteredPosts = () => {
    let result = [...posts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.username.toLowerCase().includes(q) || (p.text && p.text.toLowerCase().includes(q))
      );
    }
    return result;
  };

  const displayedPosts = getFilteredPosts();
  const getInitials = (name) => (!name ? 'U' : name[0].toUpperCase());

  return (
    <div className="app-shell-container">
      <div ref={feedTopRef}></div>
      <Navbar />

      <div className="feed-scroll-container px-3 pb-4">

        {/* Search & Utility Bar */}
        <div className="search-utility-bar d-flex align-items-center gap-2 my-3">
          <div className="search-input-wrapper position-relative flex-grow-1">
            <Form.Control
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-action-btn d-flex align-items-center justify-content-center">
              <Search size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="theme-toggle-btn d-flex align-items-center justify-content-center"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
          </button>

          <div className="search-avatar-placeholder d-flex align-items-center justify-content-center">
            {currentUser ? getInitials(currentUser.name) : 'U'}
          </div>
        </div>

        {/* ─── Create Post Card ─── */}
        <Card className="create-post-card border-0 mb-4">
          <Card.Header className="bg-transparent border-0 d-flex align-items-center justify-content-between p-3 pb-0">
            <h5 className="create-post-title m-0">Create Post</h5>
            {/* Promotion badge indicator */}
            {isPromotion && (
              <span className="promo-badge d-flex align-items-center gap-1 px-3 py-1 rounded-pill">
                <Megaphone size={13} />
                Promotion
                <button className="promo-close-btn" onClick={() => setIsPromotion(false)}><X size={12} /></button>
              </span>
            )}
          </Card.Header>

          <Card.Body className="p-3">
            <Form onSubmit={handleCreatePost}>
              {/* Main Textarea */}
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={isPromotion ? '📢 Write your promotion message...' : "What's on your mind?"}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                disabled={submitting}
                ref={textareaRef}
                className="post-textarea mb-2 border-0 bg-transparent"
              />

              {/* ── Inline Format Bar (shown when AlignLeft is toggled) ── */}
              {showFormatBar && (
                <div className="format-bar d-flex align-items-center gap-2 mb-2 px-2 py-1 rounded">
                  <button
                    type="button"
                    className="fmt-btn d-flex align-items-center gap-1"
                    onClick={() => applyTextFormat('bold')}
                    title="Bold — wraps selected text in **text**"
                  >
                    <Bold size={15} /> Bold
                  </button>
                  <button
                    type="button"
                    className="fmt-btn d-flex align-items-center gap-1"
                    onClick={() => applyTextFormat('italic')}
                    title="Italic — wraps selected text in _text_"
                  >
                    <Italic size={15} /> Italic
                  </button>
                  <span className="fmt-hint ms-auto">Select text in box then click format</span>
                </div>
              )}

              {/* ── Emoji Picker (shown when Smile is toggled) ── */}
              {showEmojiPicker && (
                <div className="emoji-picker-panel mb-2 p-2 rounded">
                  <div className="emoji-grid">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="emoji-btn"
                        onClick={() => insertEmoji(emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview-wrapper position-relative rounded mb-3 overflow-hidden">
                  <img src={imagePreview} alt="Upload preview" className="w-100 object-fit-cover" style={{ maxHeight: '220px' }} />
                  <button type="button" className="remove-preview-btn" onClick={removeImagePreview} disabled={submitting}>&times;</button>
                </div>
              )}

              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />

              {/* ── Bottom Creator Toolbar ── */}
              <div className="d-flex align-items-center justify-content-between border-top border-secondary-subtle pt-3 mt-1">
                <div className="d-flex align-items-center gap-1">

                  {/* Photo */}
                  <button
                    type="button"
                    className="creator-icon-btn-labeled d-flex flex-column align-items-center"
                    onClick={triggerFileSelect}
                    disabled={submitting}
                    title="Add Photo"
                  >
                    <Image size={19} />
                    <span>Photo</span>
                  </button>

                  {/* Emoji */}
                  <button
                    type="button"
                    className={`creator-icon-btn-labeled d-flex flex-column align-items-center ${showEmojiPicker ? 'toolbar-active' : ''}`}
                    onClick={() => { setShowEmojiPicker((v) => !v); setShowFormatBar(false); }}
                    disabled={submitting}
                    title="Insert Emoji"
                  >
                    <Smile size={19} />
                    <span>Emoji</span>
                  </button>

                  {/* Format */}
                  <button
                    type="button"
                    className={`creator-icon-btn-labeled d-flex flex-column align-items-center ${showFormatBar ? 'toolbar-active' : ''}`}
                    onClick={() => { setShowFormatBar((v) => !v); setShowEmojiPicker(false); }}
                    disabled={submitting}
                    title="Text Formatting"
                  >
                    <AlignLeft size={19} />
                    <span>Format</span>
                  </button>

                  {/* Promotion */}
                  <button
                    type="button"
                    className={`creator-icon-btn-labeled d-flex flex-column align-items-center ${isPromotion ? 'toolbar-active promo-active' : ''}`}
                    onClick={() => { setIsPromotion((v) => !v); setShowEmojiPicker(false); setShowFormatBar(false); }}
                    disabled={submitting}
                    title="Mark as Promotion"
                  >
                    <Megaphone size={19} />
                    <span>Promote</span>
                  </button>

                </div>

                {/* Post Button */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || (!postText.trim() && !imagePreview)}
                  className="post-btn d-flex align-items-center gap-2 px-4 py-2"
                >
                  {submitting ? <Spinner animation="border" size="sm" /> : <><Send size={15} /><span>Post</span></>}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Error Banner */}
        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

        {/* Feed List */}
        <div className="posts-feed-list">
          {loading && page === 1 ? (
            <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
              <Spinner animation="border" className="mb-2" />
              <p>Fetching feed...</p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <Card className="border-0 text-center p-5 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="m-0" style={{ color: 'var(--text-secondary)' }}>No posts yet. Be the first to share something!</p>
            </Card>
          ) : (
            displayedPosts.map((post) => (
              <PostCard key={post._id} post={post} currentUser={currentUser} />
            ))
          )}
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-4 mb-5">
            <Button variant="outline-primary" onClick={handleLoadMore} disabled={moreLoading} className="load-more-btn px-5 py-2 rounded-pill">
              {moreLoading
                ? <><Spinner animation="border" size="sm" className="me-2" />Loading more...</>
                : 'Load More'}
            </Button>
          </div>
        )}
      </div>

      {/* FAB scroll to top */}
      <button onClick={scrollToTop} className="floating-action-button d-flex align-items-center justify-content-center" aria-label="Scroll to top">
        <ArrowUp size={22} />
      </button>
    </div>
  );
};

export default Feed;
