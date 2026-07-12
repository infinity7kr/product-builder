"use client";

import { useMemo, useState, type FormEvent } from "react";

export interface BirthFormValues {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  timeZone: string;
}

function defaultTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function allTimeZones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["Asia/Seoul", "UTC"];
  }
}

export function BirthDesignForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (values: BirthFormValues) => void;
}) {
  const [year, setYear] = useState("1990");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [timeZone, setTimeZone] = useState(defaultTimeZone);

  const timeZones = useMemo(() => allTimeZones(), []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ year, month, day, hour, minute, timeZone });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          생년월일
          <div className="ymd">
            <div className="number-field is-year">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="년"
                aria-label="연도"
                required
              />
              <span className="unit">년</span>
            </div>
            <div className="number-field is-compact">
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="월"
                aria-label="월"
                min={1}
                max={12}
                required
              />
              <span className="unit">월</span>
            </div>
            <div className="number-field is-compact">
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="일"
                aria-label="일"
                min={1}
                max={31}
                required
              />
              <span className="unit">일</span>
            </div>
          </div>
        </label>
      </div>

      <div className="field-row">
        <label>
          출생 시간 <span className="field-hint">(정확할수록 정밀합니다)</span>
          <div className="hm">
            <div className="number-field is-compact">
              <input
                type="number"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="시"
                aria-label="시"
                min={0}
                max={23}
                required
              />
              <span className="unit">시</span>
            </div>
            <div className="number-field is-compact">
              <input
                type="number"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="분"
                aria-label="분"
                min={0}
                max={59}
                required
              />
              <span className="unit">분</span>
            </div>
          </div>
        </label>
      </div>

      <div className="field-row">
        <label>
          출생지 시간대 <span className="field-hint">(정확한 UTC 환산에 필요합니다)</span>
          <input
            type="text"
            list="timezone-options"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            placeholder="예: Asia/Seoul"
            required
          />
          <datalist id="timezone-options">
            {timeZones.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "계산 중..." : "✨ 휴먼디자인 보기"}
      </button>
    </form>
  );
}
