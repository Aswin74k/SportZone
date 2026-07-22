import React from "react";
import { FaStar, FaRegCommentDots } from "react-icons/fa";
import { FiThumbsUp } from "react-icons/fi";
import ReviewForm from "./ReviewForm";

export default function ProductReviews({
  product,
  combinedReviews,
  filteredReviews,
  ratingDistribution,
  getStarPercentage,
  allReviewImages,
  votedReviews,
  handleHelpfulVote,
  selectedRatingFilter,
  setSelectedRatingFilter,
  onlyWithImagesFilter,
  setOnlyWithImagesFilter,
  showReviewForm,
  setShowReviewForm,
  reviewSubmitting,
  onReviewSubmit,
  setActiveLightboxReviewImage
}) {
  return (
    <div id="reviews-section" className="row mt-5 pt-4 border-top">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="h4 fw-bold mb-0">Customer Reviews</h3>
          {combinedReviews.length > 0 && !showReviewForm && (
            <button
              type="button"
              className="btn btn-outline-dark rounded-pill px-4 fw-bold"
              style={{ fontSize: "0.85rem", transition: "all 0.25s" }}
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </button>
          )}
        </div>

        {combinedReviews.length > 0 && (
          <>
            <div className="row g-4 mb-4">
              
              {/* Rating summary left card */}
              <div className="col-lg-4 col-md-5 col-12">
                <div className="sz-reviews-summary-flex">
                  <div className="sz-reviews-stat-left">
                    <div className="sz-reviews-big-num">{product?.rating ?? 4.5}</div>
                    <div className="text-warning my-1" style={{ fontSize: "1.25rem" }}>
                      {"★".repeat(Math.round(product?.rating ?? 4.5))}
                      {"☆".repeat(5 - Math.round(product?.rating ?? 4.5))}
                    </div>
                    <span className="small text-muted">Out of 5 Stars</span>
                  </div>

                  {/* Progress bars that acts as click-to-filter reviews */}
                  <div className="sz-reviews-total-bar-list">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const pct = getStarPercentage(stars);
                      const isFilterActive = selectedRatingFilter === stars;
                      return (
                        <div
                          key={stars}
                          className={`sz-reviews-bar-row ${isFilterActive ? "active-filter" : ""}`}
                          onClick={() => setSelectedRatingFilter(selectedRatingFilter === stars ? null : stars)}
                        >
                          <span className="extra-small text-muted" style={{ minWidth: "40px", fontSize: "0.78rem" }}>{stars} Star</span>
                          <div className="sz-reviews-bar-track">
                            <div className="sz-reviews-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="extra-small text-muted" style={{ minWidth: "30px", fontSize: "0.78rem" }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review Photos Grid */}
              <div className="col-lg-8 col-md-7 col-12">
                <div className="sz-photo-reviews-wrapper">
                  <div className="small fw-bold text-dark uppercase mb-2">Customer Photos ({allReviewImages.length})</div>
                  {allReviewImages.length === 0 ? (
                    <div className="text-muted small py-3">No photos uploaded by customers yet.</div>
                  ) : (
                    <div className="sz-photo-reviews-grid">
                      {allReviewImages.map((img, idx) => (
                        <div
                          className="sz-photo-review-thumbnail"
                          key={idx}
                          onClick={() => setActiveLightboxReviewImage(img.src)}
                        >
                          <img src={img.src} alt="Attached review thumbnail" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Filters review tags */}
            <div className="sz-reviews-filter-bar">
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <button
                  type="button"
                  className={`sz-reviews-filter-pill ${selectedRatingFilter === null ? "active" : ""}`}
                  onClick={() => setSelectedRatingFilter(null)}
                >
                  All Reviews ({combinedReviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = combinedReviews.filter((r) => r.rating === star).length;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`sz-reviews-filter-pill ${selectedRatingFilter === star ? "active" : ""}`}
                      onClick={() => setSelectedRatingFilter(star)}
                    >
                      {star} Stars ({count})
                    </button>
                  );
                })}
              </div>

              {allReviewImages.length > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    id="imageFilterCheck"
                    className="sz-fbt-checkbox"
                    checked={onlyWithImagesFilter}
                    onChange={(e) => setOnlyWithImagesFilter(e.target.checked)}
                  />
                  <label htmlFor="imageFilterCheck" className="small fw-bold text-muted cursor-pointer">
                    Show Reviews with Images Only
                  </label>
                </div>
              )}
            </div>
          </>
        )}

        {/* Review Card List & Submission Form */}
        <div className="row g-4">
          
          {/* Reviews List */}
          {combinedReviews.length > 0 ? (
            <div className={showReviewForm ? "col-lg-7 col-12" : "col-lg-12 col-12"}>
              {filteredReviews.length === 0 ? (
                <div className="p-4 border rounded text-center text-muted small bg-light">
                  No customer reviews found matching the filters.
                </div>
              ) : (
                <div className="d-flex flex-column">
                  {filteredReviews.map((r) => {
                    const nameChar = (r.user_name || "Customer").charAt(0).toUpperCase();
                    const colors = ["#2563eb", "#db2777", "#059669", "#7c3aed", "#ea580c"];
                    const charCode = nameChar.charCodeAt(0) || 0;
                    const avatarBg = colors[charCode % colors.length];

                    return (
                      <div key={r.id} className="sz-customer-review-card">
                        
                        {/* Header details */}
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="sz-review-avatar-circle"
                              style={{ backgroundColor: avatarBg }}
                            >
                              {nameChar}
                            </div>
                            <div>
                              <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                                {r.user_name || "Customer"}
                              </div>
                              <div className="text-warning extra-small" style={{ fontSize: "0.75rem" }}>
                                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                              </div>
                            </div>
                          </div>
                          <span className="text-muted small font-medium">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
                          </span>
                        </div>

                        {/* Comment */}
                        {r.comment && (
                          <p className="text-muted mt-2 mb-2" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                            {r.comment}
                          </p>
                        )}

                        {/* Attachments */}
                        {r.images && r.images.length > 0 && (
                          <div className="d-flex gap-2 my-2">
                            {r.images.map((imgSrc, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="sz-review-image-attach"
                                onClick={() => setActiveLightboxReviewImage(imgSrc)}
                              >
                                <img src={imgSrc} alt={`Review attach ${imgIdx}`} />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Helpful vote */}
                        <div className="mt-1">
                          <button
                            type="button"
                            className={`sz-review-vote-btn ${votedReviews[r.id] ? "voted" : ""}`}
                            onClick={() => handleHelpfulVote(r.id)}
                          >
                            <FiThumbsUp /> 
                            <span>
                              {votedReviews[r.id] ? "Voted Helpful" : "Helpful"} ({r.helpful + (votedReviews[r.id] ? 1 : 0)})
                            </span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className={showReviewForm ? "col-lg-7 col-12" : "col-lg-12 col-12"}>
              <div className="p-4 border rounded text-center text-muted small bg-light h-100 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "240px" }}>
                <FaRegCommentDots size={32} className="text-muted mb-2" />
                <p className="mb-0 mt-2 fw-semibold text-dark">No reviews yet for this product</p>
                <p className="extra-small text-muted mb-3 mt-1">Be the first to share your thoughts by publishing a review.</p>
                {!showReviewForm && (
                  <button
                    type="button"
                    className="btn btn-dark rounded-pill px-4 fw-bold py-2 mt-1"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Feedback Form */}
          {showReviewForm && (
            <div className="col-lg-5 col-12">
              <ReviewForm
                onReviewSubmit={onReviewSubmit}
                reviewSubmitting={reviewSubmitting}
                setShowReviewForm={setShowReviewForm}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
