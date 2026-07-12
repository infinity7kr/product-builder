import ReactMarkdown from "react-markdown";
import type { HumanDesignApiResponse } from "@/lib/types";
import { TYPE_LABEL_KO, DEFINITION_LABEL_KO } from "@/lib/bodygraph";
import { CENTER_LABEL_KO, type Center } from "@/lib/gates";

const CENTER_ORDER: Center[] = ["Head", "Ajna", "Throat", "G", "Heart", "SolarPlexus", "Sacral", "Spleen", "Root"];

export function HumanDesignResultView({ result }: { result: HumanDesignApiResponse }) {
  return (
    <section className="result">
      <section className="card">
        <h2>
          <span aria-hidden="true">🔷</span>타입 · 전략 · 권위
        </h2>
        <div className="headline-grid">
          <div className="headline-item">
            <span className="headline-item-label">타입</span>
            <span className="headline-item-value">{TYPE_LABEL_KO[result.type]}</span>
          </div>
          <div className="headline-item">
            <span className="headline-item-label">프로파일</span>
            <span className="headline-item-value">{result.profile}</span>
          </div>
          <div className="headline-item">
            <span className="headline-item-label">정의</span>
            <span className="headline-item-value">{DEFINITION_LABEL_KO[result.definition]}</span>
          </div>
        </div>
        <p className="card-sub">전략</p>
        <p>{result.strategy}</p>
        <p className="card-sub">내적 권위</p>
        <p>{result.authorityLabel}</p>
      </section>

      <section className="card">
        <h2>
          <span aria-hidden="true">⚙️</span>센터 (정의됨 / 미정의)
        </h2>
        <div className="centers-grid">
          {CENTER_ORDER.map((c) => (
            <div key={c} className={`center-item${result.definedCenters[c] ? " is-defined" : ""}`}>
              <span className="center-dot" aria-hidden="true" />
              {CENTER_LABEL_KO[c]}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>
          <span aria-hidden="true">🔗</span>정의된 채널 ({result.definedChannels.length}개)
        </h2>
        {result.definedChannels.length > 0 ? (
          <div className="tag-row">
            {result.definedChannels.map((c) => (
              <span className="tag tag-good" key={c.key}>
                {c.key} · {CENTER_LABEL_KO[c.centers[0]]} ↔ {CENTER_LABEL_KO[c.centers[1]]}
              </span>
            ))}
          </div>
        ) : (
          <p className="note">정의된 채널이 없습니다 (리플렉터 가능성).</p>
        )}
      </section>

      <section className="card">
        <h2>
          <span aria-hidden="true">🔮</span>AI 해설
        </h2>
        <div className="interpretation">
          <ReactMarkdown>{result.interpretation}</ReactMarkdown>
        </div>
      </section>
    </section>
  );
}
