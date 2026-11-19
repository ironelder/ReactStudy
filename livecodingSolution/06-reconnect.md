# 다음 문제 6 — 보너스 추가 5: 재연결과 스냅샷 동기화

## 문제 성격과 범위

원문 문제 파일을 찾지 못해 사용자 노트 기반으로 재구성한 가상 문제다. 목표는 연결이 끊긴 뒤 재시도 간격을 지수적으로 늘리고 지터를 더해, 재연결과 스냅샷 동기화가 모두 완료된 시점에만 화면 상태를 `live`로 바꾸는 것이다.

이번에는 `reconnect(deps)` 함수 하나만 작성한다. 긴 클래스나 가짜 서버는 만들지 않는다. 호출자는 이미 연결이 끊긴 상황에서 이 함수를 한 번만 실행하도록 중복 실행을 막았다고 가정한다. stop·취소·오래된 연결 콜백 무시는 다음 문제에서 다룬다.

## 제공되는 의존성과 계약

모든 함수 타입은 아래에 명시되어 있다. 의존성 값은 호출자가 제공한다.

- `connectAndSync`: 새 연결을 열고 스냅샷 동기화까지 마쳐야 resolve한다. 동기화가 끝나기 전에는 `live`로 볼 수 없다. 연결 또는 동기화가 실패하면 시도 중 연결을 정리한 뒤 reject한다. 앞 문제의 연결·버퍼링·스냅샷 처리 기능을 묶어 제공한다고 가정하며 여기서 구현하지 않는다.
- `sleep`: 전달된 밀리초만큼 대기한 뒤 resolve하며 reject하지 않는다. 제공된 대기 함수이므로 직접 `setTimeout`을 구현하지 않는다.
- `random`: `[0, 1)` 범위의 숫자를 반환한다.
- `setStatus`: 기존 화면 store에 연결 상태를 반영하는 제공 함수다.

## 요구사항

1. 함수 시작 시 `reconnecting` 상태를 알린다.
2. 첫 연결 시도 전에도 반드시 기다린다. `attempt`는 첫 대기 때 0이다.
3. 각 대기 시간은 다음 식을 따른다. 지터를 더한 뒤 최종 값에 상한을 적용한다.

   `delay = min(8000, 500 * 2 ** attempt + floor(random() * 200))`

4. 대기 후 `connectAndSync()`를 호출한다.
5. 연결 또는 스냅샷 동기화가 실패하면 attempt를 증가시키고 같은 재시도 흐름을 계속한다.
6. 연결과 스냅샷 동기화가 성공한 경우에만 `live` 상태를 알리고 함수를 끝낸다.
7. 다음 연결 끊김으로 이 함수를 다시 호출하면 대기 간격은 첫 단계부터 다시 시작한다.

문제 구간에는 정답을 넣지 않았고, 아래 정답·해설 구간에 있습니다. 학습할 때는 사용자가 정답을 요청하기 전까지 정답 구간을 공개하지 않습니다. 아래 함수의 TODO를 완성합니다.

## TODO 골격

```ts
type ReconnectDeps = {
  connectAndSync: () => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
  setStatus: (status: 'reconnecting' | 'live') => void;
};

export async function reconnect(deps: ReconnectDeps): Promise<void> {
  const baseDelayMs = 500;
  const maxDelayMs = 8000;

  // TODO: 실패 횟수와 지터를 반영해 대기하고,
  //       connectAndSync가 성공할 때에만 live 상태로 끝내라.
}
```

## 시나리오로 확인할 동작

`random()`이 매번 `0.5`를 반환한다고 가정할 때 재시도별 대기값은 다음과 같다.

| 시도 차수 | attempt 값 | 지터 포함 계산값 | 실제 대기 |
|---:|---:|---:|---:|
| 1 | 0 | 500 + 100 | 600ms |
| 2 | 1 | 1000 + 100 | 1100ms |
| 3 | 2 | 2000 + 100 | 2100ms |
| 4 | 3 | 4000 + 100 | 4100ms |
| 5 | 4 | 8000 + 100 | 8000ms |
| 6 | 5 | 16000 + 100 | 8000ms |

두 번 실패하고 세 번째 연결과 스냅샷 동기화가 성공하면 `connectAndSync`는 총 3회 호출되고, `sleep`은 600ms, 1100ms, 2100ms로 총 3회 호출된다. 상태 호출은 시작의 `reconnecting` 뒤 마지막 `live`다.

연결만 성립하고 스냅샷 동기화가 실패한 상황도 실패로 처리되어야 한다. 그 시도에서는 `live` 상태를 알리면 안 되고 재시도해야 한다. 지터는 여러 사용자가 같은 시점에 재시도하는 현상을 분산하기 위한 것이다.

## Kotlin 문법 대응

| TypeScript | Kotlin에서 대응해 생각할 표현 | 설명 |
|---|---|---|
| `Promise<void>` | `suspend fun ...: Unit` | 비동기 완료 계약의 역할이 비슷하지만 동일한 런타임 타입은 아님 |
| `async` / `await` | `suspend` 함수 안의 순차 호출 | 비동기 결과를 기다리는 흐름 대응 |
| `sleep(ms)` | `delay(ms)` | 주어진 시간만큼 기다리는 제공 함수라는 역할 |
| `Math.min(a, b)` | `minOf(a, b)` | 상한 적용 |
| `Math.floor(x)` | `floor(x)` | 소수점 아래 버림 |
| `2 ** attempt` | `2.0.pow(attempt)` | 지수 증가 간격 계산 |
| 주입된 `random()` | 주입된 난수원 호출 | 결정적 시나리오 검토와 테스트가 쉬움 |

함수는 채팅에 `reconnect` 구현만 제출한다. 자동 테스트는 제공되지 않는다. 채팅 답안을 위 대기 시나리오와 상태 전이 기준으로 수동 검토한다. 이 문제에서는 stop·취소·재연결 중복 방지·오래된 콜백 처리를 추가하지 않는다.

---

# 문제 6 — 재연결 정답과 해설

아래는 원문이 아니라 사용자 노트로 재구성한 연습의 정답입니다. `connectAndSync`가 연결과 스냅샷 동기화를 함께 책임진다는 계약을 사용한다.

## 정답 코드

```ts
type ReconnectDeps = {
  connectAndSync: () => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
  setStatus: (status: 'reconnecting' | 'live') => void;
};

export async function reconnect(deps: ReconnectDeps): Promise<void> {
  const baseDelayMs = 500;
  const maxDelayMs = 8000;
  let attempt = 0;

  deps.setStatus('reconnecting');

  while (true) {
    const jitter = Math.floor(deps.random() * 200);
    const delay = Math.min(
      maxDelayMs,
      baseDelayMs * 2 ** attempt + jitter,
    );

    await deps.sleep(delay);

    try {
      await deps.connectAndSync();
    } catch {
      attempt++;
      continue;
    }

    deps.setStatus('live');
    return;
  }
}
```

## 블록별 설명과 Kotlin 대응

### 의존성 묶음

`ReconnectDeps`는 함수가 필요한 동작을 호출자로부터 받는다. `connectAndSync`는 연결과 스냅샷 동기화가 모두 끝나면 성공하고, 어느 단계든 실패하면 실패한다. `sleep`, 난수 생성, 화면 상태 변경도 제공 함수로 받으므로 이 함수 안에서 서버나 타이머를 새로 만들지 않는다.

Kotlin에서는 필요한 동작을 인터페이스나 함수 인자로 받는 구조에 가깝다. 이렇게 주입하면 재시도 흐름이 연결 구현과 분리된다.

### async, Promise, await

함수의 반환 타입 `Promise<void>`는 작업이 나중에 끝난다는 뜻이다. `async` 함수 안의 `await`는 해당 비동기 작업이 끝날 때까지 다음 줄의 실행을 이어가지 않는다.

Kotlin에서는 `suspend fun reconnect(...): Unit` 및 suspend 함수 호출을 기다리는 흐름과 역할이 비슷하다. 다만 JavaScript Promise와 Kotlin coroutine은 동일한 구현이나 런타임 모델이 아니다.

### 상태와 재시도 횟수

함수 진입 시 `attempt`를 0으로 만들고 먼저 `reconnecting` 상태를 알린다. 이 변수는 함수 호출마다 새로 만들어지므로 이후 연결이 다시 끊겨 `reconnect`가 새로 호출되면 다시 0부터 시작한다.

Kotlin에서도 지역 변수 `var attempt = 0`과 같은 방식으로 횟수를 보관할 수 있다. 재시도가 실패했을 때만 `attempt++` 한다.

### 지수 간격, 지터, 상한

매 반복에서 난수를 새로 뽑아 `Math.floor(random() * 200)`으로 0~199ms 지터를 계산한다. 이를 지수 간격 `500 * 2 ** attempt`에 더한 뒤 `Math.min`으로 최종 대기 시간이 8000ms를 넘지 않게 한다. 상한은 지터를 더한 값에도 적용된다.

Kotlin의 `minOf`, `floor`, `2.0.pow(attempt)`와 대응해 생각할 수 있다. 난수는 매 반복 다시 계산하며, 의존성으로 받으므로 원하는 값을 주입해 동작을 검토할 수 있다.

### 대기와 연결 시도

`await deps.sleep(delay)`가 첫 연결 시도 전에도 실행된다. 첫 시도는 `attempt === 0`으로 계산한 대기 뒤에 시작한다. `sleep`은 기다린 뒤 resolve하고 실패하지 않는다는 제공 계약이다. Kotlin에서 제공된 `delay(ms)`를 기다리는 흐름과 비슷하지만 같은 타이머 API라는 뜻은 아니다.

### 실패 처리와 종료

`try` 안에는 `connectAndSync()`만 둔다. 연결 또는 스냅샷 동기화가 실패하면 `catch`에서 횟수를 올리고 `continue`로 다음 반복에 들어간다. 이때 `live`는 설정되지 않는다. JavaScript는 catch 변수 없이 `catch { ... }`로 오류 객체를 생략할 수 있다. Kotlin의 `catch (e: Exception)`과 문법이 다르며, 여기서는 오류 내용을 사용하지 않아 변수 이름이 필요 없다.

성공하면 `try` 다음으로 실행이 이어져 `live` 상태를 알리고 `return`으로 함수 전체를 끝낸다. `continue`는 현재 반복만 마치고 반복문 다음 차례로 가며, `return`은 함수 자체를 종료한다.

Kotlin에도 `continue`, `return`, `attempt++`에 대응하는 문법이 있다. 다만 이 재구성 계약은 `connectAndSync`가 실패를 reject로 전달한다고 가정한다.

## 논리 검토 시나리오

`random()`이 매번 `0.5`이고 첫 두 연결·동기화가 실패한 뒤 세 번째가 성공한다고 가정한다.

| 반복 | attempt | 대기 계산 | 결과 |
|---:|---:|---:|---|
| 1 | 0 | 500 + 100 = 600ms | 기다린 뒤 연결·동기화 시도 1 실패, attempt 증가 |
| 2 | 1 | 1000 + 100 = 1100ms | 기다린 뒤 시도 2 실패, attempt 증가 |
| 3 | 2 | 2000 + 100 = 2100ms | 기다린 뒤 시도 3 성공, `live` 후 반환 |

따라서 `sleep`과 `connectAndSync`는 각각 3회 호출되고, 상태는 `reconnecting` 후 마지막에 `live`가 된다. 이는 코드와 시나리오를 대조한 논리 검토이며 실제 함수 실행이나 테스트 결과는 아니다.

연결은 됐지만 스냅샷 동기화가 실패하는 경우도 `connectAndSync` 전체가 reject하므로 같은 실패 경로를 탄다. 연결이 영구 실패하면 계속 재시도하고, 지터를 포함한 최대 대기 시간은 8000ms다. `await sleep` 후 재시도하므로 대기 없이 반복하는 busy loop가 아니다.

## 자주 하는 실수

| 실수 | 문제 | 바른 기준 |
|---|---|---|
| 첫 연결을 대기 없이 시도 | 첫 간격부터 대기하라는 규칙 위반 | 매 반복에서 먼저 `await deps.sleep(delay)` |
| attempt를 반복문 안에서 0으로 재설정 | 매번 첫 간격만 반복 | 함수 지역 변수로 한 번 초기화 |
| 성공 여부와 관계없이 `live` 표시 | 스냅샷 동기화 전에 연결됨으로 보일 수 있음 | `connectAndSync` 성공 뒤에만 `live` |
| 연결 성공만 확인하고 snapshot 실패를 무시 | 화면 데이터가 동기화되지 않은 채 live가 됨 | helper 전체 성공을 기다림 |
| 지터를 더하기 전에 상한 적용 | 최종 delay가 상한을 넘을 수 있음 | 지수 간격과 지터를 더한 다음 `Math.min` 적용 |
| random을 한 번만 호출 | 매 재시도 지터가 새로 계산되지 않음 | 반복마다 난수와 delay 계산 |
| `await deps.sleep(delay)`를 생략 | 실제 대기 없이 연결 요청을 반복할 수 있음 | 제공된 sleep Promise를 기다림 |
| 실패 catch 뒤 반복을 계속하지 않음 | 한 번 실패로 함수가 끝나거나 오류가 밖으로 전달됨 | 실패 횟수 증가 후 `continue` |
| 성공 뒤 return을 생략 | 성공해도 반복문이 끝나지 않음 | `live` 설정 후 `return` |
| 취소·중복 방지·정리를 새로 구현 | 이번 범위를 벗어나며 제공 계약과 중복 가능 | 호출자가 보장하는 조건에 맡기고 여기서는 구현하지 않음 |

## 범위와 검증

- 원문 부재로 재구성한 연습의 정답이다.
- 두 번 실패하고 세 번째 성공하는 대기값과 상태 흐름은 논리적으로 확인했다.
- 실제 함수 실행과 자동 테스트는 하지 않았다. 자동 테스트는 제공되지 않는다.
- stop, 취소, 중복 호출 방지, 오래된 연결 콜백 무시는 구현하지 않는다.
