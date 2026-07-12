"use client";

import { useState } from "react";
import type { HumanDesignApiResponse } from "@/lib/types";
import { BirthDesignForm, type BirthFormValues } from "@/components/BirthDesignForm";
import { HumanDesignResultView } from "@/components/HumanDesignResultView";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HumanDesignApiResponse | null>(null);

  async function handleSubmit(values: BirthFormValues) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/humandesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(values.year),
          month: Number(values.month),
          day: Number(values.day),
          hour: Number(values.hour),
          minute: Number(values.minute),
          timeZone: values.timeZone,
        }),
      });

      const text = await res.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "서버 응답을 읽는 중 연결이 끊겼습니다. AI 해설 생성에 시간이 걸릴 수 있으니 잠시 후 다시 시도해주세요.",
        );
      }
      if (!res.ok || !data) {
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "알 수 없는 오류가 발생했습니다.";
        throw new Error(message);
      }
      setResult(data as HumanDesignApiResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <span className="hero-glyph" aria-hidden="true">
          HD
        </span>
        <p className="eyebrow">
          <span aria-hidden="true">✨</span>AI 휴먼디자인 분석
        </p>
        <h1>휴먼디자인 분석</h1>
        <p className="subtitle">
          생년월일시와 출생지 시간대를 입력하면 바디그래프를 계산하고, 건강·섭식·수면·진로에 대한 해설을 AI가 만들어드립니다.
        </p>
      </header>

      <BirthDesignForm loading={loading} onSubmit={handleSubmit} />

      {error && <p className="error">{error}</p>}

      {result && <HumanDesignResultView result={result} />}
    </main>
  );
}
