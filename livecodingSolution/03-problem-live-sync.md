# 문제 3 — 순번 기반 실시간 동기화

이 문항은 사용자가 제공한 이전 학습 노트를 바탕으로 정리했습니다. 답안은 이 문서 아래에 있으므로 연습할 때는 답안 구간을 가리고 진행합니다.

## 문제 3 — 순번 기반 실시간 동기화

계약: `connect({ onMessage, onClose }): Promise<Connection>`, `getSnapshot(): Promise<{ seq, counts }>`, `Delta = { seq, candidateId, by }`. 연결을 먼저 열고 snapshot 대기 중 메시지를 버퍼링합니다. snapshot보다 큰 seq를 오름차순 적용한 뒤 live 상태로 게시합니다. 이미 반영한 seq는 무시하며, `lastSeq + 1`보다 큰 seq가 오면 해당 delta를 더하지 않고 다시 동기화합니다. 메시지 콜백은 `this`를 보존합니다.

### 구현 전제와 Kotlin 대응

아래 코드는 기존 controller 전체가 아닌 메서드·필드 발췌입니다. `api.connect`, `api.getSnapshot`, `emit`, listeners, Delta 타입과 state 게시 계약이 제공된다고 가정합니다. `syncing = true`로 시작해 초기 snapshot 전 메시지를 버퍼링하고, 연결을 먼저 시작한 뒤 snapshot을 받습니다. 이미 처리한 seq는 버리고 gap seq는 반영하지 않은 채 재동기화합니다. `onMessage: d => this.onMessage(d)`의 화살표 함수는 인스턴스 `this`를 보존합니다. Kotlin의 Map 복사, 람다, suspend 호출과 역할을 비교할 수 있지만 이벤트 루프와 coroutine은 동일하지 않습니다.

### 답안 발췌

```ts
counts: Record<string, number> = {};
lastSeq = 0;
syncing = true;
buffer: Delta[] = [];

async start(): Promise<void> {
  await this.api.connect({ onMessage: d => this.onMessage(d), onClose: () => {} });
  await this.resync();
}

async resync(): Promise<void> {
  const snap = await this.api.getSnapshot();
  this.counts = { ...snap.counts };
  this.lastSeq = snap.seq;
  this.syncing = false;
  const pending = this.buffer.filter(d => d.seq > snap.seq).sort((a, b) => a.seq - b.seq);
  this.buffer = [];
  pending.forEach(d => this.onMessage(d));
  this.emit();
}

onMessage(d: Delta): void {
  if (this.syncing) { this.buffer.push(d); return; }
  if (d.seq <= this.lastSeq) return;
  if (d.seq > this.lastSeq + 1) {
    this.syncing = true;
    this.buffer = [];
    void this.resync();
    return;
  }
  this.counts[d.candidateId] = (this.counts[d.candidateId] ?? 0) + d.by;
  this.lastSeq = d.seq;
  this.emit();
}

emit(): void {
  this.state = { counts: { ...this.counts }, status: "live" };
  this.listeners.forEach(listener => listener());
}
```

`getSnapshot`이라는 이름은 화면 store getter와 서버 API snapshot 호출 둘 다에 쓰일 수 있으므로 문맥을 확인합니다. Kotlin의 `Map` 갱신·콜백과 비교할 수 있지만 비동기 이벤트 모델은 다릅니다. 과거 노트에는 기본 시나리오 PASS 기록이 있습니다. 이 발췌는 재연결, `stop()`, 오류 처리, 버퍼를 처리하는 동안 다시 gap이 생기는 경우를 완전히 다루는 운영 코드가 아닙니다.

## 자주 하는 실수

| 실수 | 기준 |
|---|---|
| snapshot 요청 전에 메시지 수신을 연결하지 않음 | 먼저 연결하고 snapshot 대기 중 메시지를 버퍼링합니다. |
| 이미 반영한 seq를 다시 더함 | `seq <= lastSeq`면 무시합니다. |
| gap delta를 바로 반영 | gap이면 delta를 버리고 재동기화합니다. |
| 콜백에 인스턴스 메서드를 분리 전달 | 화살표 콜백으로 `this`를 보존합니다. |
