# 문제 1 — 낙관적 투표

이 문항은 사용자가 제공한 이전 학습 노트를 바탕으로 정리했습니다. 답안은 이 문서 아래에 있으므로 연습할 때는 답안 구간을 가리고 진행합니다.

## 문제 1 — 낙관적 투표

`async vote(candidateId: string): Promise<void>`를 구현합니다. 이미 `submitting`이면 연타 요청을 무시합니다. 요청 전에 선택 후보 수를 1 늘리고 투표권을 1 줄이며 상태를 `submitting`, 오류를 `null`로 바꿉니다. 성공하면 서버 응답의 `count`, `ticketsLeft`로 확정하고 `idle`로 돌아갑니다. 실패하면 내가 더한 수만 되돌리고 투표권을 복구하며 `error`와 `e.code ?? "UNKNOWN"`을 기록합니다. `api.vote(candidateId, idempotencyKey)`에는 요청별 멱등 키를 전달합니다.

초기 A 10, B 7, 투표권 3에서 요청 도착 직후 A 11, 권리 2, `submitting`이어야 합니다. 응답 전에 다른 사람의 표 5개가 반영된 뒤 성공 응답이 오면 서버 값 A 16을 표시합니다. 동시 3회 호출은 요청 한 번만 보내며, `NO_TICKET` 실패 후에는 A 10, 권리 3, `error`가 됩니다.

### 구현 전제와 Kotlin 대응

아래 코드는 기존 controller 전체가 아니라 `vote` 메서드 발췌입니다. `this.state`, `this.setState(patch)`, `this.api.vote(candidateId, key)`가 제공된다고 가정합니다. `setState`는 patch를 현재 state와 합칩니다. Kotlin에서는 `suspend` 함수 안의 순차 호출, `?:` 기본값, 기존 Map에서 새 Map을 만드는 갱신과 비교할 수 있습니다. `async`는 첫 `await` 전까지 바로 실행되므로 상태를 먼저 `submitting`으로 만들어야 연속 호출을 막습니다.

### 답안

```ts
async vote(candidateId: string): Promise<void> {
  if (this.state.status === "submitting") return;
  this.setState({
    counts: { ...this.state.counts, [candidateId]: (this.state.counts[candidateId] ?? 0) + 1 },
    ticketsLeft: this.state.ticketsLeft - 1,
    status: "submitting",
    error: null,
  });
  const key = `${Date.now()}-${Math.random()}`;
  try {
    const res = await this.api.vote(candidateId, key);
    this.setState({ counts: { ...this.state.counts, [candidateId]: res.count }, ticketsLeft: res.ticketsLeft, status: "idle" });
  } catch (e: any) {
    this.setState({
      counts: { ...this.state.counts, [candidateId]: this.state.counts[candidateId] - 1 },
      ticketsLeft: this.state.ticketsLeft + 1,
      status: "error",
      error: e?.code ?? "UNKNOWN",
    });
  }
}
```

`async` 함수는 첫 `await` 전까지 실행하므로 `submitting` 갱신을 기다림 전에 해야 합니다. 실패 때 이전 전체 state를 복구하면 다른 변경을 덮을 수 있으므로 내가 더한 표만 되돌립니다. 다만 실시간 절대 카운트와 동시에 갱신되는 복잡한 상황 및 타임아웃 뒤 서버 반영 여부는 이 간단한 예제의 한계입니다. `setState(patch)`는 이전 상태와 patch를 합치는 계약입니다. Kotlin의 `suspend`/`await`, `?:`, 맵 복사와 유사한 부분이 있지만 같은 런타임 동작은 아닙니다.

### 자주 하는 실수

| 실수 | 올바른 기준 |
|---|---|
| 첫 `await` 뒤에 submitting 처리 | 요청 전 동기 구간에서 상태를 바꿉니다. |
| 전체 이전 state를 롤백 | 내가 더한 표만 되돌립니다. |
| 응답값 대신 낙관적 값 유지 | 성공 응답의 서버 count와 투표권으로 확정합니다. |
