import { useRef, useState } from "react";

export default function ImageDropzone({ label, hint, multiple, onFiles, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    if (!fileList?.length) return;
    const files = multiple ? Array.from(fileList) : [fileList[0]];
    onFiles(files);
  };

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div
        className={`admin-dropzone ${dragOver ? "drag-over" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p>
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="small mt-1 mb-0">{hint || "PNG, JPG up to 10MB"}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="d-none"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
