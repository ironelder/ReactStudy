# 다음 문제 7 — 보너스 추가 6: 종료와 수명 정리

## 문제 성격과 범위

원문 문제를 찾지 못해 사용자 노트 기반으로 재구성한 가상 연습이다. 살아 있는 투표 실시간 controller를 최종 종료하는 수명 관리만 구현한다. `stop()`은 한 번 호출되면 끝이며 같은 인스턴스를 재시작하지 않는다. 재시작이나 generation 관리 같은 확장 설계는 이번 문제 범위가 아니다.

## 타입과 시작 상태

```ts
type Snapshot = {
  counts: Record<string, number>;
};

type Delta = {
  candidateId: string;
  amount: number;
};

type Connection = {
  close: () => void;
};

type StopDeps = {
  getSnapshot: () => Promise<Snapshot>;
  clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
  requestReconnect: () => void;
};

type Listener = () => void;
```

시작 시 snapshot은 `{ counts: { A: 10, B: 7 } }`이다. 생성자에서 이를 인자로 받아 내부 상태에 복사한다. 기존 알림 타이머와 재연결 타이머는 다른 기능에서 예약되는 필드다. 이 문제는 해당 타이머들의 예약 구현을 만들지 않고, 종료 시 주입된 `clearTimer`로 취소하는 부분만 다룬다.

## 제공 골격

아래 기본 코드와 메서드 타입은 제공된 것으로 보고, TODO인 네 메서드만 완성하라. `constructor(private ...)` 같은 TypeScript parameter property는 쓰지 않는다.

```ts
export class VoteLiveController {
  private state: Snapshot;
  private stopped = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connection: Connection | null = null;
  private buffer: Delta[] = [];
  private readonly listeners = new Set<Listener>();
  private readonly deps: StopDeps;

  constructor(initialState: Snapshot, deps: StopDeps) {
    this.state = { counts: { ...initialState.counts } };
    this.deps = deps;
  }

  getSnapshot = (): Snapshot => this.state;

  subscribe = (listener: Listener): (() => void) => {
    if (this.stopped) return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify(): void {
    if (this.stopped) return;
    for (const listener of [...this.listeners]) {
      if (this.stopped) break;
      listener();
    }
  }

  // 제공된 기존 연결은 이 콜백을 close handler로 등록했다고 가정한다.
  private onClose = (): void => {
    if (this.stopped) return;
    this.deps.requestReconnect();
  };

  stop(): void {
    // TODO
  }

  onMessage(delta: Delta): void {
    // TODO
  }

  async refreshSnapshot(): Promise<void> {
    // TODO
  }

  async attachConnection(pending: Promise<Connection>): Promise<void> {
    // TODO
  }
}
```

`pending`은 외부에서 시작한 연결 시도의 Promise다. 이 함수가 연결을 새로 만드는 것은 아니다. 동시에 여러 연결 시도가 진행되지는 않는다고 가정한다. `Connection.close()`는 예외를 던지지 않지만 동기적으로 `onClose`를 호출할 수 있다.

## 요구사항

- `stop()`은 이미 종료된 경우 아무것도 하지 않는다. 최초 종료에서는 외부 코드나 `close()`보다 먼저 `stopped`를 true로 바꾼다.
- 각 타이머 필드가 `null`이 아니면 `clearTimer`로 취소하고 필드를 `null`로 비운다. 숫자 핸들 `0`도 유효할 수 있으므로 null 비교를 사용한다.
- connection 필드를 비우고 기존 연결을 닫는다. 그 뒤 buffer와 listeners를 비운다. 종료 자체로 listener를 알리는 동작은 없다.
- `onMessage`는 이미 종료됐다면 버리고, 살아 있으면 delta를 buffer에 넣는다. seq 처리와 실제 반영은 제공된 기존 로직의 책임이다.
- `refreshSnapshot`은 호출 시 이미 종료됐다면 `deps.getSnapshot()`을 시작하지 않고 반환한다. API를 시작한 뒤 종료된 경우에는 결과를 무시한다. 살아 있으면 받은 값으로 새 snapshot을 교체하고 `notify()`한다. API 실패는 호출자가 처리하므로 별도 catch를 만들지 않는다.
- `attachConnection`은 전달받은 pending을 기다린다. 연결 결과가 도착했을 때 이미 종료됐다면 그 연결을 즉시 닫고 필드에 저장하지 않는다. 살아 있으면 connection 필드에 보관한다.
- `attachConnection`의 pending은 이미 외부에서 진행 중인 연결 시도다. 메서드 진입 시 종료 상태여도 pending은 기다려야 하며, 늦게 도착한 연결을 즉시 닫고 필드에 저장하지 않는다.
- `notify()`는 제공된 코드처럼 종료 상태에서는 listener를 부르지 않는다. 한 listener가 동기적으로 `stop()`을 호출하면 복사된 목록의 다음 listener를 부르기 전에 반복 안에서 종료 상태를 확인해 중단한다. 종료된 뒤 `subscribe`가 호출돼도 등록되지 않는다.

## 시나리오로 확인

1. 두 timer가 예약돼 있고 연결·buffer·listener가 있는 상태에서 `stop()`을 호출한다. 두 timer가 각각 취소되고 연결은 한 번 닫히며 buffer와 listener가 비워진다.
2. 다시 `stop()`을 불러도 추가 timer 취소나 연결 close가 발생하지 않는다.
3. `refreshSnapshot()` 호출 시 이미 stop됐다면 API 요청을 시작하지 않는다. 진행 중이던 API 응답이 `stop()` 뒤 도착하는 경우에도 기존 state가 유지되고 알림이 없다.
4. `attachConnection(pending)`을 시작한 다음 `stop()`하고 pending이 resolve된다. 메서드는 진행 중 pending을 기다리고, 새 연결은 즉시 닫히며 controller 필드에는 저장되지 않는다.
5. `close()`가 동기적으로 `onClose`를 호출해도 `requestReconnect()`가 실행되지 않는다. 이를 위해 종료 플래그가 외부 close보다 먼저 설정되어야 한다.
6. 종료 후 `onMessage(delta)`는 buffer에 추가하지 않는다.

자동 테스트나 타입 검사는 요구하지 않는다. 채팅에 네 메서드 구현을 제출하면 위 여섯 시나리오를 기준으로 수동 검토한다. 원래 자동 테스트가 제공된 문제는 아니다.

## Kotlin 대응

`Connection | null`은 Kotlin의 nullable `Connection?`과 비슷하다. timer 취소를 위해 clear 함수를 호출하는 것은 예약 작업 취소에 대응한다. 종료 플래그만 바꾸는 것으로 이미 예약된 Promise나 타이머가 자동 취소되는 것은 아니다. 비동기 결과를 `await`한 뒤 종료 여부를 다시 확인하는 흐름은 Kotlin에서도 필요할 수 있지만, JavaScript Promise와 Kotlin coroutine cancellation은 완전히 같은 동작이 아니다.

---

# 문제 7 — 종료와 수명 정리 정답

이 정답은 원문이 없는 재구성 연습에 대한 답이다. 아래 네 메서드를 기존 `VoteLiveController` 클래스에 붙인다. `stop()`은 최종 종료이며 같은 인스턴스를 재시작하지 않는다.

## 정답 코드

```ts
stop(): void {
  if (this.stopped) return;
  this.stopped = true;

  if (this.flushTimer !== null) {
    this.deps.clearTimer(this.flushTimer);
    this.flushTimer = null;
  }
  if (this.reconnectTimer !== null) {
    this.deps.clearTimer(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  const connection = this.connection;
  this.connection = null;
  connection?.close();

  this.buffer = [];
  this.listeners.clear();
}

onMessage(delta: Delta): void {
  if (this.stopped) return;
  this.buffer.push(delta);
}

async refreshSnapshot(): Promise<void> {
  if (this.stopped) return;

  const snapshot = await this.deps.getSnapshot();
  if (this.stopped) return;

  this.state = { counts: { ...snapshot.counts } };
  this.notify();
}

async attachConnection(pending: Promise<Connection>): Promise<void> {
  const connection = await pending;

  if (this.stopped) {
    connection.close();
    return;
  }

  this.connection = connection;
}
```

## 블록별 설명과 Kotlin 대응

### 종료는 한 번만 하고, 먼저 플래그를 세운다

`stop()`은 이미 종료됐으면 바로 반환한다. 처음 종료할 때는 `stopped = true`를 가장 먼저 수행한다. 이어지는 `close()`가 `onClose`를 동기적으로 호출해도 `onClose`가 종료 상태를 보고 재연결을 요청하지 않게 된다.

Kotlin에서도 `if (stopped) return`과 `stopped = true`라는 순서는 같은 의도로 쓸 수 있다. 외부 동작을 부르기 전에 객체가 종료됐음을 표시하는 것이 핵심이다.

### 타이머 핸들을 취소하고 비운다

각 timer가 `null`이 아닐 때만 주입된 `clearTimer`를 한 번 호출하고, 필드를 `null`로 되돌린다. `!== null` 비교는 핸들 값이 `0`이어도 예약으로 올바르게 인식한다.

필드에 `null`을 넣는 것만으로 실제 예약이 취소되지는 않는다. 실제 취소 요청은 `clearTimer(handle)`이고, null 대입은 controller가 더 이상 해당 핸들을 보관하지 않는다는 표시다. Kotlin에서도 보관한 예약 핸들을 취소 API에 넘기는 흐름과 비슷하지만 반환 핸들의 타입과 동작은 플랫폼마다 다를 수 있다.

### 연결 참조를 먼저 비우고 닫는다

현재 연결을 지역 변수에 담고 controller의 `connection` 필드는 먼저 `null`로 만든 다음 연결을 닫는다. 종료 상태도 이미 설정되어 있으므로 동기 `onClose` 콜백은 재연결을 요청하지 않는다. 마지막으로 buffer와 listeners를 비우며 `stop()` 자체는 알림을 보내지 않는다.

Kotlin에서는 nullable `Connection?`를 지역 변수로 옮긴 뒤 필드를 비우고 safe call로 닫는 흐름에 가깝다. 자원 참조를 소유 필드에서 먼저 분리하면 콜백 중에도 객체 상태가 종료된 것으로 일관된다.

### 메시지는 종료 뒤 버린다

`onMessage`는 종료 상태면 즉시 반환하고, 살아 있을 때만 delta를 buffer에 넣는다. seq 검증이나 카운트 적용은 이 메서드의 책임이 아니다.

Kotlin에서도 같은 조기 반환을 사용할 수 있다. 종료 후 새 입력이 내부 버퍼에 다시 쌓이지 않도록 경계에서 막는다.

### snapshot 조회는 await 전후를 확인한다

이미 종료된 상태에서 `refreshSnapshot()`이 호출되면 API를 시작하지 않는다. 요청을 시작한 뒤 종료됐다면 완료된 결과를 버린다. 살아 있다면 전달받은 snapshot을 복사해 새 state로 교체하고 제공된 `notify()`를 호출한다. API 오류는 호출자에게 전달되므로 여기서 catch하지 않는다.

Kotlin에서도 suspend 호출 전에 활성 상태를 확인하고, `await`에 해당하는 호출 뒤에도 상태를 확인하는 것이 유용하다. 다만 이 검사는 결과 사용을 막는 로직이지 Promise를 취소하는 동작이 아니다. JavaScript Promise와 Kotlin coroutine cancellation은 동일하지 않다.

### pending 연결은 await 뒤 닫을 수 있어야 한다

`attachConnection`은 이미 외부에서 진행 중인 `pending` Promise를 인자로 받는다. 메서드 진입 시 종료 상태여도 await를 생략하지 않는다. pending이 resolve된 다음 종료 여부를 확인해, 늦게 도착한 연결을 닫거나 활성 상태의 필드에 보관한다.

snapshot 결과는 버려도 되지만 connection은 열린 자원이므로 종료 이후 resolve되어도 닫아야 한다. Kotlin에서도 suspend 결과를 받은 뒤 활성 상태를 재확인할 수 있지만, coroutine 취소가 같은 의미로 자동 적용되는 것은 아니다. 동시 연결 시도는 없고 종료 후 재시작도 없다는 계약을 전제로 한다.

## 시나리오 논리 검토

| 상황 | 기대 결과 | 코드상 확인 |
|---|---|---|
| timer 두 개 예약 중 stop | 각각 취소, 필드 null | 두 핸들을 각각 조건 검사 후 clear하고 비움 |
| 활성 연결에서 stop | 연결 한 번 닫힘, buffer/listeners 비움 | 참조를 비운 뒤 닫고 두 컬렉션을 비움 |
| 두 번째 stop | 추가 취소·close 없음 | 첫 guard에서 반환 |
| snapshot이 stop 뒤 도착 | state 유지, 알림 없음 | await 뒤 stopped 확인 후 반환 |
| stop 뒤 snapshot 갱신 호출 | API를 시작하지 않음 | await 전 첫 guard에서 반환 |
| pending 연결이 stop 뒤 도착 | 늦은 연결을 닫고 저장하지 않음 | await 뒤 stopped 분기에서 close 후 반환 |
| close가 동기 onClose 호출 | 재연결 요청 없음 | 외부 close보다 먼저 stopped가 true |
| stop 뒤 메시지 도착 | buffer에 넣지 않음 | onMessage 첫 guard에서 반환 |

위 표는 코드 흐름을 대조한 논리 검토이며 실제 테스트 결과가 아니다.

## 자주 하는 실수

| 실수 | 문제 | 바른 기준 |
|---|---|---|
| close 전에 stopped를 설정하지 않음 | 동기 onClose가 재연결을 요청할 수 있음 | 외부 코드보다 먼저 stopped 설정 |
| timer 필드를 null로만 변경 | 실제 예약은 계속 실행될 수 있음 | clearTimer 호출 후 null로 비움 |
| `if (timer)`로 검사 | 핸들 0을 예약 없음으로 오해 | `timer !== null` 검사 |
| 연결을 닫은 뒤 필드를 비움 | close 콜백 중 아직 활성 연결처럼 보임 | 지역 변수로 옮기고 필드부터 null 처리 |
| snapshot await 뒤 종료 확인 생략 | 종료 후 state가 바뀌고 listener가 호출될 수 있음 | await 뒤 stopped 재검사 |
| 종료 뒤 snapshot API를 새로 호출 | 불필요한 작업을 시작함 | API 호출 전에도 stopped 검사 |
| attachConnection이 종료 상태면 바로 반환 | 이미 진행 중인 pending 결과를 받아도 연결을 닫지 못함 | pending은 await하고 도착한 연결을 종료 상태에 따라 처리 |
| stop 후 메시지를 buffer에 추가 | 종료된 객체에 데이터가 다시 쌓임 | onMessage 진입 시 종료 여부 검사 |
| stop 자체에서 listeners에 알림 | 종료 뒤 listener 실행이라는 불필요한 부작용 | listeners를 비우고 종료 알림은 하지 않음 |

## 검증 범위

여섯 시나리오를 코드 흐름으로 논리 검토했다. 자동 테스트와 타입 검사는 실행하지 않았다. 원래 자동 테스트가 제공된 문제는 아니며 실측 통과를 주장하지 않는다.
