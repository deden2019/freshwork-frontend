"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";

interface WorklogFormProps {
  ticketId: string | string[];
  onWorklogAdded: () => void;
}

export default function WorklogForm({
  ticketId,
  onWorklogAdded,
}: WorklogFormProps) {
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] =
    useState("");

  async function submitWorklog() {
    const response = await apiFetch(
      `/tickets/${ticketId}/worklogs`,
      {
        method: "POST",
        body: JSON.stringify({
          work_minutes: Number(minutes),
          work_description: description,
        }),
      }
    );

    if (response.ok) {
      setMinutes("");
      setDescription("");
      onWorklogAdded();
    }
  }

  return (
    <div>
      <input
        placeholder="Work Minutes"
        value={minutes}
        onChange={(e) =>
          setMinutes(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        rows={4}
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={submitWorklog}>
        Add Worklog
      </button>
    </div>
  );
}