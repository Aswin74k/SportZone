import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaStar } from "react-icons/fa";

export default function ReviewForm({ onReviewSubmit, reviewSubmitting, setShowReviewForm }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { rating: 5, comment: "" }
  });

  const ratingValue = watch("rating") || 5;
  const [hoverRating, setHoverRating] = useState(0);

  const onSubmit = (data) => {
    onReviewSubmit(data, reset);
  };

  return (
    <div className="sz-submit-review-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h6 fw-bold m-0 uppercase tracking-wider text-dark">Submit Feedback</h4>
        <button
          type="button"
          className="btn-close"
          style={{ fontSize: "0.8rem" }}
          onClick={() => setShowReviewForm(false)}
          aria-label="Close form"
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
        <div>
          <label className="form-label small fw-bold text-dark uppercase tracking-wider">Overall Rating</label>
          <div className="d-flex align-items-center gap-1 my-1">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const active = starValue <= (hoverRating || ratingValue);
              return (
                <button
                  key={starValue}
                  type="button"
                  className="border-0 bg-transparent p-0 star-rating-btn"
                  style={{ cursor: "pointer", transition: "transform 0.1s" }}
                  onClick={() => setValue("rating", starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${starValue} stars`}
                >
                  <FaStar
                    size={28}
                    className={active ? "text-warning" : "text-muted"}
                    style={{
                      color: active ? "var(--sz-color-warning)" : "#d1d5db",
                      filter: active ? "drop-shadow(0 0 2px rgba(234, 179, 8, 0.2))" : "none"
                    }}
                  />
                </button>
              );
            })}
            <span className="small font-semibold ms-2 text-muted" style={{ fontSize: "0.85rem", minWidth: "80px" }}>
              {(() => {
                const r = hoverRating || ratingValue;
                if (r === 5) return "Excellent";
                if (r === 4) return "Very Good";
                if (r === 3) return "Good";
                if (r === 2) return "Fair";
                if (r === 1) return "Poor";
                return "";
              })()}
            </span>
          </div>
        </div>
        
        <div>
          <label className="form-label small fw-bold text-dark uppercase tracking-wider">Review Message</label>
          <textarea
            className="form-control form-control-sm"
            rows={4}
            placeholder="Tell us what you liked or disliked about this product..."
            {...register("comment", { required: "Review message is required." })}
            style={{ fontSize: "0.85rem", lineHeight: "1.4" }}
          />
          {errors.comment && (
            <div className="text-danger small mt-1">{errors.comment.message}</div>
          )}
        </div>
        
        <button
          type="submit"
          className="btn sz-purchase-btn buy-now py-2 mt-1"
          disabled={reviewSubmitting}
        >
          {reviewSubmitting ? "Publishing Review..." : "Publish Review"}
        </button>
      </form>
    </div>
  );
}
