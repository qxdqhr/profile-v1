import React from "react";

const Contact: React.FC = () => {
  return (
    <div id="contact" className="contact-container">
      <h2 className="module-title">联系方式</h2>
      <div className="contact-content">
        <div className="contact-info">
          <div className="contact-card">
            <div className="contact-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>邮箱</h3>
            <a href="mailto:your.email@example.com" className="contact-link">
              your.email@example.com
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <i className="fab fa-github"></i>
            </div>
            <h3>GitHub</h3>
            <a href="https://github.com/yourusername" className="contact-link" target="_blank" rel="noopener noreferrer">
              @yourusername
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <i className="fab fa-weixin"></i>
            </div>
            <h3>微信</h3>
            <span className="contact-text">your_wechat_id</span>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <i className="fab fa-qq"></i>
            </div>
            <h3>QQ</h3>
            <span className="contact-text">123456789</span>
          </div>
        </div>

        <div className="contact-message">
          <div className="message-card">
            <h3>给我留言</h3>
            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="您的称呼" className="form-input" />
              </div>
              <div className="form-group">
                <input type="email" placeholder="您的邮箱" className="form-input" />
              </div>
              <div className="form-group">
                <textarea placeholder="留言内容" className="form-input" rows={4}></textarea>
              </div>
              <button type="submit" className="submit-button">
                发送消息
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 