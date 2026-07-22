import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import API from "../../../api";

export function useReviews(id, isAuthenticated, navigate) {
  const [reviews, setReviews] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [onlyWithImagesFilter, setOnlyWithImagesFilter] = useState(false);
  const [votedReviews, setVotedReviews] = useState({});
  const [activeLightboxReviewImage, setActiveLightboxReviewImage] = useState(null);

  // Load reviews
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    API.get(`reviews/?product=${id}`)
      .then((res) => {
        if (!mounted) return;
        const d = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setReviews(d);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id]);

  // Submit review
  const onReviewSubmit = async (data, resetForm) => {
    if (!isAuthenticated) {
      toast.info("Please log in to write a review.");
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    try {
      setReviewSubmitting(true);
      await API.post("reviews/", {
        product: Number(id),
        rating: Number(data.rating || 5),
        comment: data.comment
      });
      toast.success("Thanks! Your review will appear after approval.");
      if (resetForm) resetForm({ rating: 5, comment: "" });
      setShowReviewForm(false);
      const r = await API.get(`reviews/?product=${id}`);
      const d = Array.isArray(r.data) ? r.data : r.data?.results ?? [];
      setReviews(d);
    } catch (err) {
      toast.error("Could not submit review. You may have already reviewed this product.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Ratings calculation & Filter lists
  const combinedReviews = useMemo(() => {
    return reviews.map((r, index) => ({
      id: r.id || `api-${index}`,
      user_name: r.user_name || "Customer",
      rating: r.rating || 5,
      comment: r.comment || "",
      created_at: r.created_at || new Date().toISOString(),
      helpful: r.helpful || 0,
      images: r.images || []
    }));
  }, [reviews]);

  // Distribution ratios
  const ratingDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    combinedReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
      }
    });
    return counts;
  }, [combinedReviews]);

  const getStarPercentage = (stars) => {
    if (combinedReviews.length === 0) return 0;
    return Math.round((ratingDistribution[stars - 1] / combinedReviews.length) * 100);
  };

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return combinedReviews.filter((r) => {
      const matchStars = selectedRatingFilter === null ? true : r.rating === selectedRatingFilter;
      const matchImages = !onlyWithImagesFilter ? true : (r.images && r.images.length > 0);
      return matchStars && matchImages;
    });
  }, [combinedReviews, selectedRatingFilter, onlyWithImagesFilter]);

  // Aggregate review images
  const allReviewImages = useMemo(() => {
    const list = [];
    combinedReviews.forEach((r) => {
      if (r.images && r.images.length > 0) {
        r.images.forEach((img) => {
          list.push({ src: img, reviewId: r.id });
        });
      }
    });
    return list;
  }, [combinedReviews]);

  // Increment helpful review vote
  const handleHelpfulVote = (reviewId) => {
    if (votedReviews[reviewId]) return;
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
  };

  return {
    reviews,
    reviewSubmitting,
    showReviewForm,
    setShowReviewForm,
    selectedRatingFilter,
    setSelectedRatingFilter,
    onlyWithImagesFilter,
    setOnlyWithImagesFilter,
    votedReviews,
    activeLightboxReviewImage,
    setActiveLightboxReviewImage,
    combinedReviews,
    ratingDistribution,
    getStarPercentage,
    filteredReviews,
    allReviewImages,
    handleHelpfulVote,
    onReviewSubmit
  };
}
