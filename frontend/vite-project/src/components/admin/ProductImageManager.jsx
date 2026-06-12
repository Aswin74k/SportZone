import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import { mediaUrl } from "../../utils/mediaUrl";
import ImageDropzone from "./ImageDropzone";

/**
 * Manages primary + gallery images for products.
 * - Create mode: pending files; one marked primary goes to FormData `image`.
 * - Edit mode: uses add_image / remove-image APIs; set primary via PATCH with blob.
 */
export default function ProductImageManager({
  productId,
  primaryUrl,
  gallery = [],
  pendingFiles = [],
  primaryPendingKey,
  onPendingChange,
  onPrimaryPendingKey,
  onRefresh,
}) {
  const [uploading, setUploading] = useState(false);

  const addPending = (files) => {
    const next = [
      ...pendingFiles,
      ...files.map((file) => ({
        key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ];
    onPendingChange(next);
    if (!primaryPendingKey && !primaryUrl && next.length) {
      onPrimaryPendingKey(next[0].key);
    }
  };

  const removePending = (key) => {
    const item = pendingFiles.find((p) => p.key === key);
    if (item?.preview) URL.revokeObjectURL(item.preview);
    const next = pendingFiles.filter((p) => p.key !== key);
    onPendingChange(next);
    if (primaryPendingKey === key) {
      onPrimaryPendingKey(next[0]?.key ?? null);
    }
  };

  const uploadToGallery = async (file) => {
    if (!productId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      await API.post(`products/${productId}/add_image/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image added to gallery");
      onRefresh?.();
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDropFiles = (files) => {
    if (productId) {
      files.forEach((f) => uploadToGallery(f));
    } else {
      addPending(files);
    }
  };

  const removeGalleryImage = async (imageId) => {
    if (!productId || !window.confirm("Remove this image from the gallery?")) return;
    try {
      await API.delete(`products/${productId}/remove-image/`, { params: { image_id: imageId } });
      toast.success("Image removed");
      onRefresh?.();
    } catch {
      toast.error("Could not remove image");
    }
  };

  const setPrimaryFromUrl = async (url, label) => {
    if (!productId) return;
    setUploading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = blob.type?.includes("png") ? "png" : "jpg";
      const fd = new FormData();
      fd.append("image", new File([blob], `primary.${ext}`, { type: blob.type || "image/jpeg" }));
      await API.patch(`products/${productId}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${label || "Image"} set as primary`);
      onRefresh?.();
    } catch {
      toast.error("Could not set primary image");
    } finally {
      setUploading(false);
    }
  };

  const tiles = [];

  if (primaryUrl) {
    tiles.push({
      key: "primary-existing",
      src: mediaUrl(primaryUrl),
      isPrimary: true,
      type: "primary",
    });
  }

  gallery.forEach((img) => {
    tiles.push({
      key: `gallery-${img.id}`,
      src: mediaUrl(img.image),
      id: img.id,
      type: "gallery",
    });
  });

  pendingFiles.forEach((p) => {
    tiles.push({
      key: p.key,
      src: p.preview,
      isPrimary: primaryPendingKey === p.key,
      type: "pending",
    });
  });

  return (
    <div>
      <ImageDropzone
        label="Product images"
        hint={productId ? "Upload adds to gallery instantly" : "First image can be set as primary before save"}
        multiple
        onFiles={handleDropFiles}
      />
      {uploading && (
        <p className="small text-muted mt-2 mb-0">
          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
          Uploading…
        </p>
      )}

      {tiles.length > 0 && (
        <div className="admin-image-grid">
          {tiles.map((tile) => (
            <div
              key={tile.key}
              className={`admin-image-tile ${tile.isPrimary || (tile.type === "primary" && !primaryPendingKey) ? "is-primary" : ""}`}
            >
              <img src={tile.src} alt="" />
              {(tile.isPrimary || tile.type === "primary") && <span className="admin-image-primary-tag">Primary</span>}
              <div className="admin-image-tile-actions">
                {tile.type === "pending" && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => onPrimaryPendingKey(tile.key)}
                  >
                    Set primary
                  </button>
                )}
                {tile.type === "gallery" && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setPrimaryFromUrl(tile.src, "Gallery image")}
                  >
                    Set primary
                  </button>
                )}
                {tile.type === "pending" ? (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removePending(tile.key)}>
                    Remove
                  </button>
                ) : tile.type === "gallery" ? (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeGalleryImage(tile.id)}>
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {!productId && pendingFiles.length === 0 && (
        <p className="small text-muted mt-2 mb-0">Add at least one image before creating the product.</p>
      )}
    </div>
  );
}
