"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";

interface CommentFormProps {
  ticketId: string | string[];
  onCommentAdded: () => void;
}

export default function CommentForm({
  ticketId,
  onCommentAdded,
}: CommentFormProps) {
  const [comment, setComment] = useState("");

  async function submitComment() {
    if (!comment.trim()) return;

    const response = await apiFetch(
      `/tickets/${ticketId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({
          comment,
        }),
      }
    );

    if (response.ok) {
      setComment("");
      onCommentAdded();
    }
  }

  return (
    <div>
      <textarea
        rows={4}
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        style={{
          width: "100%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button onClick={submitComment}>
        Add Comment
      </button>
    </div>
  );
}