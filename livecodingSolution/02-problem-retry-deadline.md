# 문제 2 — 재시도와 서버 기준 마감

이 문항은 사용자가 제공한 이전 학습 노트를 바탕으로 정리했습니다. 답안은 이 문서 아래에 있으므로 연습할 때는 답안 구간을 가리고 진행합니다.

## 문제 2 — 재시도와 서버 기준 마감

문제 1에 더해 `TIMEOUT`, `SERVER_BUSY`만 최초 요청 포함 최대 3회 재시도합니다. 재시도 사이에는 `retryDelayMs`만큼 기다리고, 같은 논리 요청에는 같은 멱등 키를 씁니다. `NO_TICKET`, `CLOSED`는 즉시 최종 실패입니다. 새 투표는 새 키를 만듭니다.

`init()`에서 `getVoteInfo()`로 `deadline`, `serverTime`, `counts`, `ticketsLeft`를 받아 `serverOffset = serverTime - deviceNow()`를 계산합니다. `serverNow()`는 `deviceNow() + serverOffset`입니다. 마감 뒤 요청은 네트워크 요청이나 낙관적 수치 변경 없이 `closed`로 바꾸고 오류는 비웁니다. 키 생성 시각과 마감 판정 시각은 별개입니다.

### 구현 전제와 Kotlin 대응

코드는 기존 controller의 일부 메서드와 필드 발췌이며 완전한 원본 파일이 아닙니다. `api.getVoteInfo`, `api.vote`, `deviceNow`, `retryDelayMs`, `setState(patch)`가 제공된다고 가정합니다. 동일 투표의 멱등 키는 재시도 반복문 바깥에서 한 번 생성하므로 모든 시도가 같은 키를 씁니다. 성공 시 `return`으로 함수가 끝나며, 실패 횟수는 최대 3회입니다. 시간 판정은 주입된 `deviceNow()`에 서버 오프셋을 더합니다. Kotlin에서는 `suspend`, `delay`, `?:`, `minOf`와 비교할 수 있지만 Promise와 coroutine 취소 동작은 같지 않습니다.

### 답안

```ts
serverOffset = 0;

async init(): Promise<void> {
  const info = await this.api.getVoteInfo();
  this.deadline = info.deadline;
  this.serverOffset = info.serverTime - this.deviceNow();
  this.setState({ counts: { ...info.counts }, ticketsLeft: info.ticketsLeft, status: "idle", error: null });
}

serverNow(): number {
  return this.deviceNow() + this.serverOffset;
}

async vote(candidateId: string): Promise<void> {
  if (this.state.status === "submitting") return;
  if (this.serverNow() > this.deadline) {
    this.setState({ status: "closed", error: null });
    return;
  }
  const before = this.state.counts[candidateId] ?? 0;
  this.setState({ counts: { ...this.state.counts, [candidateId]: before + 1 }, ticketsLeft: this.state.ticketsLeft - 1, status: "submitting", error: null });
  const key = `${Date.now()}-${Math.random()}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await this.api.vote(candidateId, key);
      this.setState({ counts: { ...this.state.counts, [candidateId]: res.count }, ticketsLeft: res.ticketsLeft, status: "idle" });
      return;
    } catch (e: any) {
      const retryable = e.code === "TIMEOUT" || e.code === "SERVER_BUSY";
      if (retryable && attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
        continue;
      }
      this.setState({ counts: { ...this.state.counts, [candidateId]: (this.state.counts[candidateId] ?? 0) - 1 }, ticketsLeft: this.state.ticketsLeft + 1, status: "error", error: e.code ?? "UNKNOWN" });
      return;
    }
  }
}
```

원래 노트의 마감 분기는 이전 오류를 초기화하지 않는 누락이 있어 요구사항에 맞춰 `error: null`을 보완했습니다. 원본 테스트는 재실행하지 않았습니다. 노트에 적힌 추가 시나리오 기록은 재시도 요청 3회 제한, 같은 키 재사용, 서버 시각 보정으로 마감 뒤 요청 0회 등을 포함한 과거 PASS 기록이며 현재 보완본 실측 결과가 아닙니다.

### 자주 하는 실수

| 실수 | 올바른 기준 |
|---|---|
| 반복 안에서 멱등 키 생성 | 새 투표마다 한 번, 반복문 밖에서 생성합니다. |
| 네 번 이상 재시도 | 최초 요청 포함 최대 세 번으로 제한합니다. |
| 마감 확인에 `Date.now()` 직접 사용 | 주입된 시계와 서버 시간 오프셋을 사용합니다. |
| 성공 뒤 반복 계속 | 서버 응답 반영 후 `return`합니다. |
| 마감 분기에서 이전 오류 유지 | `error: null`로 초기화합니다. |
