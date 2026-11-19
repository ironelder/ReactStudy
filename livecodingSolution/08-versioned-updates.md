# 다음 문제 8 — 오래된 투표 응답과 실시간 득표 갱신

## 문제 성격과 범위

기존 노트의 원문이나 실제 기출이 아니라, 현재 연습 흐름에 새로 추가한 가상 응용 문제다. 서버가 확정한 후보별 득표 수를 화면 상태에 반영하는 `applyUpdate(update: CountUpdate): void` 하나를 완성한다.

이번 문제는 서버가 확정한 득표만 관리한다. 투표 직후 서버 응답을 기다리지 않고 화면 수를 먼저 올리는 낙관적 `+1`, 투표권, 이벤트 순번 유실 처리는 범위 밖이다.

## 서버 계약

HTTP 투표 응답과 실시간 이벤트는 같은 형식으로 후보별 `version`과 절대 `count`를 보낸다.

```ts
type CountUpdate = {
  candidateId: string;
  count: number;
  version: number;
};
```

- `version`은 후보마다 따로 매기는 0 이상의 정수다. 같은 후보에서는 더 큰 버전이 더 최신이다.
- 같은 후보에 같은 버전이 오면 `count`도 같다.
- 중간 버전을 건너뛰어도 된다. `count`는 변화량이 아니라 해당 버전 시점의 절대 득표 수다.
- 이벤트가 도착한 순서, 기기 시간, 득표 수의 크기로 최신 여부를 판단하지 않는다. 후보별 `version`으로 판단한다.
- 서버 정정으로 더 최신 버전의 `count`가 이전보다 작아질 수도 있다. 따라서 count가 증가하는지만으로 업데이트 여부를 판단하지 않는다.

## 제공된 코드

아래 코드와 메서드들은 제공된 것으로 보고, `applyUpdate` 안의 TODO만 구현한다. HTTP와 실시간 입력 경로는 이미 `applyUpdate`를 호출한다.

```ts
type CountUpdate = {
  candidateId: string;
  count: number;
  version: number;
};

type Snapshot = {
  counts: Record<string, number>;
};

type Listener = () => void;

export class VoteCountStore {
  private state: Snapshot = {
    counts: { A: 10, B: 7 },
  };

  private versions: Record<string, number> = {
    A: 100,
    B: 200,
  };

  private readonly listeners = new Set<Listener>();

  getSnapshot = (): Snapshot => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  onVoteResponse(update: CountUpdate): void {
    this.applyUpdate(update);
  }

  onRealtime(update: CountUpdate): void {
    this.applyUpdate(update);
  }

  applyUpdate(update: CountUpdate): void {
    // TODO: 후보별 version을 기준으로 필요한 경우에만 state를 갱신하고 알린다.
  }
}
```

`counts`는 모든 후보의 득표 수를 담은 맵이다. 예를 들어 `counts.A`는 A 후보의 수 10이고, `counts.B`는 B 후보의 수 7이다. 각 업데이트의 `count`는 그 맵 전체가 아니라 `candidateId`가 가리키는 후보 하나의 새 수다. 그러므로 A 업데이트를 반영해도 B의 값은 유지되어야 한다.

## 요구사항

- 새 업데이트는 해당 후보에 저장된 버전과 비교한다. 아직 한 번도 보지 못한 후보도 들어올 수 있으며, 그 후보의 첫 버전은 0일 수도 있다.
- 입력 버전이 해당 후보에 저장된 버전보다 최신일 때만 반영한다.
- 반영하면 `state`와 `counts` 모두 새 객체 참조가 되며, 업데이트 후보의 count와 버전을 저장한다. 다른 후보의 count와 버전은 보존한다.
- 실제 반영 때 listener를 각각 한 번 알린다.
- 오래된 버전이나 같은 버전의 입력은 상태를 바꾸지 않는다. 이때 `getSnapshot()`은 이전과 같은 객체 참조를 반환하고 listener 알림은 0회다.
- 버전 비교는 후보별이다. 예를 들어 B의 버전 200이 저장돼 있다는 이유로 A의 버전 101을 버려서는 안 된다.
- 두 입력 경로가 모두 같은 `applyUpdate`를 거치므로 HTTP와 실시간 입력에 별도의 갱신 규칙을 만들지 않는다.

## 시나리오로 확인

알림 횟수는 각 단계에서 해당 업데이트 처리로 발생한 listener 호출 수다. 시작 상태는 `A: 10 (v100)`, `B: 7 (v200)`이며 아직 listener가 0회 알림을 받았다.

1. `onRealtime({ candidateId: 'A', count: 16, version: 106 })` 도착: 상태는 `A: 16 (v106)`, `B: 7 (v200)`이 된다. listener는 1회 알림을 받는다.
2. 그 뒤 늦은 HTTP 응답 `onVoteResponse({ candidateId: 'A', count: 11, version: 101 })` 도착: 최신 실시간 득표 A 16이 유지된다. 스냅샷 참조는 그대로이고 listener 추가 알림은 0회다.
3. 같은 이벤트가 한 번 더 와서 `onRealtime({ candidateId: 'A', count: 16, version: 106 })` 처리: 상태는 유지되고 listener 추가 알림은 0회다.
4. `onVoteResponse({ candidateId: 'B', count: 8, version: 201 })` 도착: B만 8, v201로 바뀌고 A는 16, v106으로 유지된다. listener는 1회 알림을 받는다.
5. 처음 보는 후보 `onRealtime({ candidateId: 'C', count: 3, version: 0 })` 도착: C 3, v0이 추가되고 A와 B는 유지된다. listener는 1회 알림을 받는다.

독립 확인: 초기 상태로 새 store를 만들고 `onVoteResponse({ candidateId: 'A', count: 11, version: 101 })`만 호출한다. B의 v200과 상관없이 A는 11, v101이 되어야 하며 listener는 1회 알림을 받는다. 전체에 단일 버전 하나만 두는 구현은 이 사례를 통과하지 못한다.

## Kotlin으로 연결해 보기

| TypeScript | Kotlin에서 떠올릴 대응 |
| --- | --- |
| `Record<string, number>` | `Map<String, Int>` 또는 숫자 타입에 맞는 `Map<String, Long>` |
| `value ?? fallback` | `value ?: fallback` |
| `{ ...oldMap, [key]: value }`처럼 새 객체 만들기 | `oldMap + (key to value)`처럼 새 맵 만들기 |
| `getSnapshot()`이 `state` 반환 | 현재 상태 객체를 반환하고, 변경 없을 때 같은 객체를 유지하는 흐름 |

Kotlin의 `Map`과 여기의 TypeScript 객체는 문법과 세부 동작이 같지는 않지만, 키로 후보별 값을 찾고 갱신한다는 점을 대응해서 보면 된다. `getSnapshot`은 외부 구독자가 현재 상태를 읽는 통로다. 상태에 변경이 없으면 기존 객체를 그대로 반환하고, 변경했을 때 새 상태 객체를 만든다.

자동 테스트나 타입 검사는 요구하지 않는다. 답안을 제출하면 위 시나리오를 기준으로 수동 검토한다.

---

# 문제 8 정답 — 오래된 투표 응답과 실시간 득표 갱신

## 정답 코드

```ts
applyUpdate(update: CountUpdate): void {
  const { candidateId, count, version } = update;
  const lastVersion = this.versions[candidateId] ?? -1;

  if (version <= lastVersion) return;

  this.versions[candidateId] = version;
  this.state = {
    counts: {
      ...this.state.counts,
      [candidateId]: count,
    },
  };

  this.listeners.forEach((listener) => listener());
}
```

## 동작 설명

각 후보의 마지막 `version`과 들어온 버전을 비교한다. 같은 버전이나 더 오래된 버전이면 즉시 반환하므로 상태 참조도 그대로고 알림도 없다. 더 최신인 경우에만 버전을 저장하고 count를 반영한 새 `counts`와 새 `state`를 만든 다음 listener를 한 번씩 부른다.

`versions`는 화면 구독 대상인 `state`가 아니라 내부 비교용 기록이므로 직접 갱신해도 된다. 반면 React가 스냅샷 변경을 감지할 수 있도록 `state`와 그 안의 `counts`는 둘 다 새 객체로 만든다.

아직 기록이 없는 후보는 `?? -1`로 마지막 버전을 -1로 취급한다. -1은 아직 저장된 버전이 없다는 기준을 명시하고, 유효한 첫 버전 0을 허용한다. 기본값을 0으로 두면 첫 버전 0을 중복으로 오인한다.

## Kotlin으로 연결해 보기

- `const { candidateId, count, version } = update`는 객체의 이름 있는 속성을 꺼내는 TypeScript 구조 분해다. Kotlin에서는 대응을 위해 `val candidateId = update.candidateId`, `val count = update.count`, `val version = update.version`처럼 세 개의 `val` 선언을 쓸 수 있다. Kotlin의 위치 기반 `componentN` 구조 분해와 같은 방식이라고 보면 안 된다.
- `this.versions[candidateId] ?? -1`은 맵에서 후보 버전을 조회하고 없으면 기본값을 쓰는 흐름이다. Kotlin의 `?:`가 비슷한 역할을 한다.
- `{ ...counts, [candidateId]: count }`에서 대괄호 안 `candidateId`는 변수에 든 문자열을 키로 쓴다는 뜻이다. Kotlin에서는 `counts + (candidateId to count)`처럼 기존 맵에 항목을 더한 새 맵을 만들 수 있다.
- 스냅샷을 읽을 때 `getSnapshot()`은 현재 `state`를 반환한다. 변경이 없으면 기존 참조를 유지하고, 변경이 있을 때 새 상태를 반환하는 흐름이다.

## 시나리오 확인

초기 상태는 A 10(v100), B 7(v200)이다. 아래 알림 수는 각 입력 하나로 인해 추가 발생한 횟수다.

| 입력 | 결과 | 추가 알림 |
| --- | --- | ---: |
| 실시간 A 16(v106) | A 16(v106), B 7(v200) | 1회 |
| 늦은 HTTP A 11(v101) | 상태 참조 유지, A 16 유지 | 0회 |
| 중복 A 16(v106) | 상태 참조 유지 | 0회 |
| HTTP B 8(v201) | A 16(v106), B 8(v201) | 1회 |
| 실시간 새 후보 C 3(v0) | C 3(v0) 추가 | 1회 |
| 서버 정정 A 15(v107) | A 15(v107)로 갱신 | 1회 |

정정 입력처럼 더 최신 버전의 count가 이전보다 작아도 반영한다. 서버가 보내는 절대 count를 쓰므로 `Math.max`로 count를 비교하면 안 된다. 별도 확인으로 초기 상태에서 A 11(v101)을 적용하면 B의 v200과 무관하게 반영되고 1회 알림이 발생한다. 버전은 전체 공통 하나가 아니라 후보별로 비교한다.

같은 count라도 더 최신 버전이면 이번 계약에서는 새 버전을 기록하고 listener를 1회 알린다. count가 같다는 이유로 별도 최적화하지 않는다.

## 자주 하는 실수

| 실수 | 문제 | 올바른 처리 |
| --- | --- | --- |
| 전체 store에 버전 하나만 둠 | B의 높은 버전이 A 업데이트를 막을 수 있음 | 후보 ID별 버전을 비교 |
| 버전 없는 후보를 0으로 간주 | 첫 버전 0을 중복으로 오해할 수 있음 | 마지막 버전 기본값을 -1로 둠 |
| count가 더 큰 입력만 반영 | 최신 서버 정정으로 득표가 줄 때 잘못 버림 | count 크기와 무관하게 version으로 판단 |
| 기존 `counts`를 직접 수정 | 스냅샷 내부 참조가 바뀌지 않아 변경 감지가 안 될 수 있음 | 새 `counts`와 새 `state` 생성 |
| 오래되거나 같은 버전에도 새 객체 생성/알림 | 불필요한 렌더와 알림 발생 | 비교 후 즉시 반환 |
| 최신 버전인데 count가 같으면 생략 | 버전이 최신 값으로 갱신되지 않음 | 새 버전이면 count가 같아도 반영하고 알림 |
| 알림 전에 갱신을 끝내지 않음 | listener가 이전 상태를 읽을 수 있음 | 버전과 state를 갱신한 뒤 알림 |

자동 테스트나 타입 검사는 실행하지 않았다. 정답 코드와 시나리오를 논리적으로 대조했다.
