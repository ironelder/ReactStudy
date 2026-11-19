# 다음 문제 5 — 추가 4: 실시간 득표 알림 묶기

## 문제 성격과 범위

이 문제는 원문을 찾지 못해 사용자 노트를 바탕으로 재구성한 가상 연습이다. 이미 seq 중복·유실 처리가 끝난 **유효한 실시간 득표 메시지**가 들어온다고 가정하고, UI 알림 배치만 구현하라. 이 차례에서는 재연결과 `stop()`/정리 동작을 구현하지 않는다. 문제 구간에는 정답을 넣지 않았고, 아래 정답·해설 구간에 있습니다. 학습할 때는 사용자가 정답을 요청하기 전까지 정답 구간을 공개하지 않습니다.

목표는 메시지마다 구독자에게 알리지 않고 `flushMs` 동안 들어온 득표 변경을 모아 한 번 알리는 것이다. 내부 `counts`는 메시지가 도착할 때 바로 누적한다. 첫 메시지가 들어오면 타이머 하나를 예약한다. 타이머가 예약된 동안 추가 메시지는 누적만 하고 타이머를 뒤로 미루지 않는다. 시간이 되면 현재 counts를 복사한 새 state를 만들고 listeners를 정확히 한 번 호출한다. 타이머 상태를 비워서 다음 메시지 묶음이 새로 예약되게 한다. 입력이 없으면 타이머도 알림도 없다.

이는 매 입력마다 flush 시각을 미루는 debounce가 아니다. 첫 입력 시각 기준의 고정 창 하나로 묶는 방식이다.

## 기대 동작 예시

`flushMs = 50`, 시작 counts가 `{ A: 10, B: 7 }`이고 초기 snapshot은 이미 구독자에게 게시됐다고 가정한다.

| 시간 | 유효 메시지 | 내부 counts 직후 | 알림 |
|---|---|---|---|
| 시작 | 없음 | A 10, B 7 | 시작 snapshot은 이미 게시됨 |
| t0 | A +1 | A 11, B 7 | 타이머 1개 예약, 아직 없음 |
| t20 | A +1 | A 12, B 7 | 기존 타이머 유지, 아직 없음 |
| t40 | B +1 | A 12, B 8 | 기존 타이머 유지, 아직 없음 |
| t50 | 타이머 만료 | 새 snapshot A 12, B 8 | listeners 1회 호출 |
| t60 | A +1 | A 13, B 8 | 다음 묶음 타이머 1개 예약 |
| t110 | 타이머 만료 | 새 snapshot A 13, B 8 | listeners 1회 호출 |

유효 메시지가 없으면 타이머와 추가 알림이 없어야 한다.

## 주어진 계약과 타입

아래 `LiveCountsBatcher` 골격에서 직접 구현할 부분은 `scheduleEmit()` 하나뿐이다. 나머지는 기본 제공 코드로 두고 변경하지 않는다. 타입 선언, 일반 필드와 constructor 대입을 사용한다. `constructor(private ...)` 형태의 TS parameter property는 사용하지 않는다.

`setTimer`는 부모/런타임이 주입하는 스케줄러다. 골격 안에서 전역 `setTimeout`을 직접 호출하지 않는다. 타이머 핸들은 `ReturnType<typeof setTimeout> | null`이다.

```ts
type Counts = Record<string, number>;
type CountsSnapshot = { counts: Counts };
type Listener = () => void;
type SetTimer = (
  callback: () => void,
  delayMs: number,
) => ReturnType<typeof setTimeout>;

export class LiveCountsBatcher {
  private counts: Counts;
  private state: CountsSnapshot;
  private readonly listeners = new Set<Listener>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly flushMs: number;
  private readonly setTimer: SetTimer;

  constructor(
    initialCounts: Counts,
    flushMs: number,
    setTimer: SetTimer,
  ) {
    this.counts = { ...initialCounts };
    // 시작 snapshot은 이미 게시된 것으로 간주한다.
    this.state = { counts: { ...this.counts } };
    this.flushMs = flushMs;
    this.setTimer = setTimer;
  }

  getSnapshot = (): CountsSnapshot => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // 유효성·seq 순서 처리가 끝난 득표 delta만 전달된다고 가정한다.
  onValidDelta = (candidateId: string, delta: number): void => {
    this.counts[candidateId] = (this.counts[candidateId] ?? 0) + delta;
    this.scheduleEmit();
  };

  private emit(): void {
    this.state = { counts: { ...this.counts } };
    for (const listener of [...this.listeners]) listener();
  }

  private scheduleEmit(): void {
    // TODO: 첫 입력 기준 flushMs 타이머 하나만 예약하고,
    //       만료 시 timer를 null로 되돌린 뒤 새 snapshot을 게시하라.
    //       타이머가 이미 예약되어 있으면 예약 시각을 미루지 않는다.
  }
}
```

### 구현 기준

1. 입력 delta는 내부 `counts`에 즉시 누적된다(기본 제공 함수가 처리).
2. 예약 중이 아니면 `this.setTimer(callback, this.flushMs)`를 한 번 호출한다.
3. 예약 중 추가 입력은 기존 타이머를 유지한다. 예약 시각을 다시 설정하지 않는다.
4. 타이머가 실행되면 타이머 필드를 먼저 `null`로 비운 뒤 `emit()`을 한 번 호출한다.
5. `emit()`은 새 state와 새 counts 객체를 만들고 현재 listeners 각각을 한 번 호출한다(기본 제공 함수가 처리).
6. 타이머가 비워진 이후 첫 입력은 새 묶음을 예약할 수 있다.
7. 메시지가 없으면 예약 및 추가 알림이 없어야 한다.

### Kotlin 대응

`Counts`는 `Map<String, Int>`에 가깝고, `Listener`는 `() -> Unit` 콜백이다. 내부 `counts` 누적은 mutable map 갱신, `state` 교체는 새 불변 data class snapshot 게시로 생각할 수 있다. `SetTimer`는 지연 실행 콜백 주입 함수이며, Kotlin의 `ScheduledExecutor`나 테스트용 가상 스케줄러 주입과 개념이 비슷하다. 다만 JS 이벤트 루프와 Kotlin 스케줄러의 실행 모델은 같지 않다.

### 답안 확인 방식

자동 채점 테스트는 제공하지 않는다. 채팅에 `scheduleEmit()`만 작성해 제출하면, 기준 1~7과 t0/t20/t40/t50/t60/t110 타임라인으로 수동 검토한다. 구현 답안은 아래 정답·해설 구간에 있다. 학습할 때는 사용자가 정답을 요청하기 전까지 해당 구간을 공개하지 않는다. 사용자가 힌트를 요청하면 규칙 하나만 제공한다. 재연결과 stop은 이 문제 뒤 차례에서 다룬다.

---

# 문제 5 — 실시간 득표 알림 묶기 정답

이 답은 위 문제 구간에 적힌 재구성 연습의 `scheduleEmit()`만 구현한다. seq 중복·유실 처리, 재연결, `stop()`/취소는 범위에 포함하지 않는다.

## 정답 함수

```ts
private scheduleEmit(): void {
  if (this.timer !== null) return;

  this.timer = this.setTimer(() => {
    this.timer = null;
    this.emit();
  }, this.flushMs);
}
```

## 동작 설명

1. `this.timer !== null`이면 이미 묶음 타이머가 예약된 상태이므로 바로 반환한다. 새 입력은 `onValidDelta()`에서 내부 `counts`에 이미 누적됐고, 예약 시각은 연장하지 않는다. 그래서 debounce가 아니라 첫 입력 기준의 고정 시간 창이다.
2. 예약이 없으면 주입된 `this.setTimer`에 콜백과 `this.flushMs`를 전달한다. `setTimeout`을 직접 호출하지 않는다.
3. 콜백의 화살표 함수는 컨트롤러 인스턴스의 `this`를 유지한다. 타이머가 실행되면 먼저 `this.timer = null`로 예약 필드를 비우고 이어서 `emit()`을 호출한다.
4. `emit()`은 실행 시점의 최신 내부 `counts`를 새 snapshot으로 복사하고 listeners에 알린다. 메시지마다 바뀌는 count 값을 콜백에 캡처할 필요가 없다.

`timer = null`은 이미 만료되어 실행된 예약을 나타내던 필드를 초기화한다. 타이머를 취소하는 동작이 아니다. 콜백 안에서 `emit()`보다 먼저 비우므로 listener가 동기적으로 새 delta를 발생시키더라도 새 묶음 타이머를 예약할 수 있다.

### 타이머 핸들 판정

`timer`는 예약 여부와 예약 식별값을 함께 담는다. 따라서 `if (this.timer)`가 아니라 `this.timer !== null`로 확인해야 한다. 타이머 핸들이 숫자 `0`인 환경이나 테스트 스케줄러에서도 `0`은 유효한 핸들이고, 예약 상태는 null 여부로 구분한다.

### Kotlin 대응

`this.setTimer(callback, delay)`는 Kotlin의 `Handler.postDelayed` 또는 지연 콜백을 받는 예약 함수에 개념적으로 대응한다. 둘은 반환 핸들의 구체 타입, 이벤트 루프/스레드 모델, 코루틴 동작이 서로 같지 않다. 여기서 핸들은 예약 중 여부를 확인하기 위해 보관하고, 예약 콜백은 Kotlin 람다처럼 동작한다고 이해하면 된다.

함수는 예약을 등록한 뒤 즉시 반환하므로 `Promise`, `async`, `await`가 필요 없다. Kotlin 코드에서도 지연 콜백 등록을 곧바로 suspend 함수로 바꿔야 하는 것은 아니다.

## 타임라인 논리 확인

`flushMs = 50`, 시작 counts `{ A: 10, B: 7 }`, 초기 snapshot은 이미 게시된 상태를 기준으로 한다.

| 시각 | 이벤트 | 내부 counts | 알림 |
|---|---|---|---|
| t0 | A +1 | A 11, B 7 | 예약 1개, 아직 알림 없음 |
| t20 | A +1 | A 12, B 7 | 기존 예약 유지 |
| t40 | B +1 | A 12, B 8 | 기존 예약 유지 |
| t50 | 첫 타이머 만료 | 새 snapshot A 12, B 8 | `emit()` 1회 |
| t60 | A +1 | A 13, B 8 | 다음 예약 1개 |
| t110 | 두 번째 타이머 만료 | 새 snapshot A 13, B 8 | `emit()` 1회 |

이 결과는 코드 흐름으로 논리 검토한 것이다. 타이머를 실행하는 자동 테스트나 실제 런타임 검증을 수행한 결과는 아니다.

## 자주 하는 실수

| 실수 | 왜 문제인가 | 올바른 기준 |
|---|---|---|
| 매 입력마다 타이머를 다시 예약 | flush가 계속 미뤄져 debounce처럼 동작 | 핸들이 이미 있으면 즉시 반환 |
| `if (this.timer)`로 확인 | 유효 핸들 `0`을 미예약으로 오인 | `this.timer !== null` 사용 |
| `setTimeout`을 함수 안에서 직접 호출 | 주입된 스케줄러 계약과 테스트 가능한 경계를 무시 | `this.setTimer(callback, this.flushMs)` 호출 |
| 일반 함수 콜백에서 인스턴스 필드 접근 | 콜백의 `this`가 controller를 가리키지 않을 수 있음 | 화살표 콜백으로 인스턴스 `this` 보존 |
| `emit()` 후 timer를 null 처리 | emit 중 listener가 새 delta를 넣으면 기존 타이머로 오인해 예약 누락 가능 | emit 전에 timer를 null로 초기화 |
| null 대입을 타이머 취소로 해석 | 이미 실행된 예약의 필드만 비운 것 | 취소는 하지 않으며 예약 종료 상태를 표시 |
| 각 메시지 count를 콜백에 저장 | 배치 시점의 최종 누적값을 놓칠 수 있음 | 입력마다 내부 counts 즉시 누적, emit 시점에 최신 값을 복사 |
| async/await 또는 Promise 추가 | 예약 후 즉시 반환하는 함수에 불필요한 비동기 계층 추가 | 타이머 등록만 하고 반환 |
| 재연결·stop·취소까지 구현 | 이번 문제 범위를 넘어감 | 요청된 배치 예약 함수만 작성 |

## 범위

- 원문이 아니라 사용자 노트 기반으로 재구성한 연습의 정답이다.
- 구현은 `scheduleEmit()` 하나뿐이다. `emit`, `onValidDelta` 등 기본 제공 코드는 수정하지 않는다.
- 자동 테스트와 런타임 테스트는 실행하지 않았다. 원래 테스트 통과 여부를 주장하지 않는다.
